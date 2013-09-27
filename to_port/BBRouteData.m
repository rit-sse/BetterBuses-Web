//
//  BBRouteData.m
//  RITBetterBusses
//
//  Created by Steve on 9/11/13.
//  Copyright (c) 2013 Altece. All rights reserved.
//

#import "BBRouteData.h"
#import "NSArray+Functional.h"
@import JavaScriptCore;

@interface BBRouteData ()
@property (retain, readwrite, nonatomic) NSDictionary *data;
@property (retain) JSContext *javascriptContext;
@property (retain, readwrite, nonatomic) NSArray *stops;
@property (retain, readwrite, nonatomic) NSArray *routes;

- (NSDictionary *)firstDepartureInRoute:(NSString *)route fromStop:(NSString *)source atOrAfterTime:(NSString *)time onDay:(NSString *)day;
- (NSDictionary *)firstArrivalFromStop:(NSString *)source InRoute:(NSString *)route toStop:(NSString *)destination afterTime:(NSString *)time onDay:(NSString *)day;

- (NSArray *)pathForRoute:(NSString *)route fromStop:(NSString *)source toStop:(NSString *)destination startingAtTime:(NSString *)time onDay:(NSString *)day;
@end

@implementation BBRouteData

+ (instancetype)routeData {
    static BBRouteData *routeData;
    if (routeData == nil) {
        routeData = [[self class] new];
    }
    return routeData;
}

- (id)init {
    if (self = [super init]) {
        NSError *error = nil;
        
        // read in JSON data
        NSURL *JSONURL = [[NSBundle mainBundle] URLForResource:@"schedule" withExtension:@"json"];
        NSData *rawJSONData = [NSData dataWithContentsOfURL:JSONURL];
        self.data = [NSJSONSerialization JSONObjectWithData:rawJSONData options:0 error:&error];
        if (error != nil) {
            NSLog(@"Error reading JSON data. %@", error);
            self = nil;
            return self;
        }
        
        // read in JavaScript algorithms
        _javascriptContext = [[JSContext alloc] init];
        [_javascriptContext evaluateScript:[NSString stringWithContentsOfURL:[[NSBundle mainBundle] URLForResource:@"algorithm" withExtension:@"js"] encoding:NSStringEncodingConversionAllowLossy error:&error]];
        if (error != nil) {
            NSLog(@"Error loading algorithm script from bundle. %@", error);
            self = nil;
            return self;
        }
        
        // load in the JSON data into the JavaScript context
        [_javascriptContext evaluateScript:[NSString stringWithFormat:@"Routes = %@", [NSString stringWithContentsOfURL:JSONURL encoding:NSStringEncodingConversionAllowLossy error:&error]]];
        if (error != nil) {
            NSLog(@"Error reading JSON text. %@", error);
            self = nil;
            return self;
        }
    }
    return self;
}

#pragma mark - Algorithm Methods

- (NSArray *)stops {    
    if (_stops == nil) {
        NSMutableArray *result = [NSMutableArray array];
        for (NSDictionary *routeData in [self.data objectEnumerator]) {
            for (NSString *stopKey in [routeData keyEnumerator]) {
                if (![result containsObject:stopKey]) {
                    [result addObject:stopKey];
                }
            }
        }
        self.stops = [result sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
    }
    return _stops;
}

- (NSArray *)routes {
    if (_routes == nil) {
        NSMutableArray *result = [NSMutableArray array];
        for (NSString *routeKey in [self.data keyEnumerator]) {
            if (![result containsObject:routeKey]) {
                [result addObject:routeKey];
            }
        }
        self.routes = result;
        self.stops = [result sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
    }
    return _routes;
}

- (NSArray *)stopsForRoute:(NSString *)route {
    NSMutableArray *result = [NSMutableArray array];
    for (NSString *stop in [self.data[route] keyEnumerator]) {
        [result addObject:stop];
    }
    return [result sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
}

- (NSArray *)routesForStop:(NSString *)stop {
    NSMutableArray *result = [NSMutableArray array];
    for (NSString *routeKey in [self.data keyEnumerator]) {
        if (self.data[routeKey][stop] != nil) {
            [result addObject:routeKey];
        }
    }
    return [result sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
}

- (NSArray *)stopsReachableFromStop:(NSString *)stop {
    NSArray *routesForStop = [self routesForStop:stop];
    NSMutableArray *result = [NSMutableArray array];
    for (NSString *route in routesForStop) {
        for (NSString *routeStop in [self stopsForRoute:route]) {
            if (![result containsObject:routeStop] && ![routeStop isEqualToString:stop]) {
                [result addObject:routeStop];
            }
        }
    }
    return [result sortedArrayUsingSelector:@selector(localizedCaseInsensitiveCompare:)];
}

- (NSArray *)scheduleForRoute:(NSString *)route fromStop:(NSString *)source toStop:(NSString *)destination onDay:(NSString *)day {
    return [self.data[route][source][@"departures"] reduceWithDefault:[NSMutableArray array] function:^id(id result, id departure) {
        NSArray *path = [self pathForRoute:route fromStop:source toStop:destination startingAtTime:departure[@"time"] onDay:day];
        if (path) {
            [result addObject:path];
        }
        return result;
    }];
}

- (NSDictionary *)schedulesForRoutes:(NSArray *)routes fromStop:(NSString *)source toStop:(NSString *)destination onDay:(NSString *)day {
    NSMutableDictionary *result = [NSMutableDictionary dictionary];
    for (NSString *route in routes) {
        NSArray *schedule = [self scheduleForRoute:route fromStop:source toStop:destination onDay:day];
        if ([schedule count] != 0) {
            result[route] = schedule;
        }
    }
    return result;
//    JSValue *value = [self.javascriptContext evaluateScript:[NSString stringWithFormat:@"findScheduleFromRoutes([%@], %@, %@);", [JSValue valueWithObject:routes inContext:self.javascriptContext], source, destination]];
//    return [value toDictionary];
}

- (NSDictionary *)routeSchedulesFromStop:(NSString *)source toStop:(NSString *)destination onDay:(NSString *)day {
    return [self schedulesForRoutes:[self routesForStop:source] fromStop:source toStop:destination onDay:day];
}

- (NSArray *)timeSortedSchedulesFromStop:(NSString *)source toStop:(NSString *)destination onDay:(NSString *)day {
    return [[[[self routeSchedulesFromStop:source toStop:destination onDay:day] allValues] reduceWithDefault:[NSMutableArray array] function:^id(NSMutableArray *result, NSArray *value) {
        return [result arrayByAddingObjectsFromArray:value];
    }] sortedArrayUsingComparator:^NSComparisonResult(NSArray *obj1, NSArray *obj2) {
        NSInteger t1 = [self timevalue:[obj1 firstObject][@"departs"][@"time"]];
        NSInteger t2 = [self timevalue:[obj2 firstObject][@"departs"][@"time"]];
        if (t1 == t2) {
            return NSOrderedSame;
        } else if (t1 > t2) {
            return NSOrderedDescending;
        } else {
            return NSOrderedAscending;
        }
    }];
}

- (NSArray *)timeSortedSchedulesFromStop:(NSString *)source toStop:(NSString *)destination onDay:(NSString *)day atOrAfterTime:(NSString *)time {
    NSInteger currentTime = [self timevalue:time];
    return [[self timeSortedSchedulesFromStop:source toStop:destination onDay:day] filter:^BOOL(NSArray *v) {
        if ([self timevalue:[v firstObject][@"departs"][@"time"]] >= currentTime) {
            return YES;
        }
        return NO;
    }];
}

#pragma mark - basic javascript interaction interfaces

- (NSInteger)timevalue:(NSString *)timeString {
    return [[[self.javascriptContext evaluateScript:[NSString stringWithFormat:@"timevalue('%@');", timeString]] toNumber] integerValue];
}

- (NSDictionary *)firstDepartureInRoute:(NSString *)route fromStop:(NSString *)source atOrAfterTime:(NSString *)time onDay:(NSString *)day {
    NSInteger targetTime = [self timevalue:time];
    return [self.data[route][source][@"departures"] reduceWithDefault:nil function:^id(id result, id departure) {
        NSInteger currentTime = [self timevalue:departure[@"time"]];
        if (currentTime >= targetTime && [departure[@"days"] containsObject:day]) {
            if (result) {
                if ([self timevalue:result[@"time"]] <= currentTime) {
                    return result;
                }
            }
            return departure;
        }
        return result;
    }];
}

- (NSDictionary *)firstArrivalFromStop:(NSString *)source InRoute:(NSString *)route toStop:(NSString *)destination afterTime:(NSString *)time onDay:(NSString *)day {
    NSInteger targetTime = [self timevalue:time];
    return [self.data[route][destination][@"arrivals"] reduceWithDefault:nil function:^id(id result, id arrival) {
        NSInteger currentTime = [self timevalue:arrival[@"time"]];
        if (currentTime > targetTime && [arrival[@"from"] isEqualToString:source] && [arrival[@"days"] containsObject:day]) {
            if (result) {
                if (currentTime >= [self timevalue:result[@"time"]]) {
                    return result;
                }
            }
            return arrival;
        }
        return result;
    }];
}

- (NSArray *)pathForRoute:(NSString *)route fromStop:(NSString *)source toStop:(NSString *)destination startingAtTime:(NSString *)time onDay:(NSString *)day {
    NSMutableArray *result = [NSMutableArray array];
    NSString *currentStop = source;
    NSString *currentTime = time;
    while (YES) {
        NSDictionary *departure = [self firstDepartureInRoute:route fromStop:currentStop atOrAfterTime:currentTime onDay:day];
        if (!departure) {
            result = nil;
            return nil;
        }
        if ([source isEqualToString:departure[@"to"]]) {
            result = nil;
            return nil;
        }
        currentTime = departure[@"time"];
        NSDictionary *arrival = [self firstArrivalFromStop:currentStop InRoute:route toStop:departure[@"to"] afterTime:currentTime onDay:day];
        if (!arrival) {
            result = nil;
            return nil;
        }
        currentTime = arrival[@"time"];
        currentStop = departure[@"to"];
        [result addObject:@{@"departs" : departure, @"arrives" : arrival, @"route" : route}];
        if ([currentStop isEqualToString:destination]) {
            return result;
        }
    }
}



@end

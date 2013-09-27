//
//  BBRouteData.m
//  RITBetterBusses
//
//  Created by Steve on 9/11/13.
//  Copyright (c) 2013 Altece. All rights reserved.
//

#import "BBRouteData.h"
#import "NSArray+Functional.h"

@interface BBRouteData ()
@property (retain, readwrite, nonatomic) NSDictionary *data;
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

#pragma mark - basic javascript interaction interfaces

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

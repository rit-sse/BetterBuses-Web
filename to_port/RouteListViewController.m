//
//  RouteListViewController.m
//  RITBetterBusses
//
//  Created by Steve on 9/24/13.
//  Copyright (c) 2013 Altece. All rights reserved.
//

#import "RouteListViewController.h"
#import "RouteJumpCell.h"

@interface RouteListViewController ()

@end

@implementation RouteListViewController

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    RouteJumpCell *cell = [tableView dequeueReusableCellWithIdentifier:@"ScheduleStopCell" forIndexPath:indexPath];
    
    NSString *from = self.route[indexPath.row][@"arrives"][@"from"];
    NSString *to = self.route[indexPath.row][@"departs"][@"to"];
    
    NSString *arrival = self.route[indexPath.row][@"arrives"][@"time"];
    NSString *departure = self.route[indexPath.row][@"departs"][@"time"];
    
    cell.jumpTitle.text = [NSString stringWithFormat:@"%@ to %@", from, to];
    cell.jumpTimes.text = [NSString stringWithFormat:@"Departs at %@, arrives at %@.", departure, arrival];
    
    return cell;
}

@end

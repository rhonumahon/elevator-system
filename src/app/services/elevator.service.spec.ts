import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ElevatorService } from './elevator.service';
import { Request } from '../models/elevator.model';

describe('ElevatorService', () => {
  let service: ElevatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElevatorService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial elevator positions as [1, 1, 1, 1]', () => {
    expect(service['elevatorPositions']).toEqual([1, 1, 1, 1]);
  });

  it('should add request to the correct floor', () => {
    const floor = 3;
    const direction = 'up';
    service.handleRequest(floor, direction);
    expect(service['floorRequests'][floor]).toEqual([direction]);
  });

  it('should assign elevator to request', () => {
    spyOn(service, 'assignElevatorToRequest');
    const floor = 4;
    const direction = 'down';
    service.handleRequest(floor, direction);
    expect(service['assignElevatorToRequest']).toHaveBeenCalledWith(floor, direction);
  });

  it('should move the elevator and change status after 2 seconds', fakeAsync(() => {
    const elevatorIndex = 0;
    const currentPosition = 1;
    const targetFloor = 3;
    const movementTime = 2; // constant movement time is 2 seconds per floor
    const timeToMove = Math.abs(currentPosition - targetFloor) * movementTime;

    // Call the method to move the elevator
    service.moveElevator(elevatorIndex, currentPosition, targetFloor);

    // Initially, the elevator should be moving
    expect(service['elevatorStatus'][elevatorIndex]).toBe(`Moving to floor ${targetFloor}`);

    //Wait until the elevator reaches the target floor (after the movement time)
    tick(timeToMove * 1000); //Converts movement duration to milliseconds

    // After moving, the elevator should have reached the target floor
    expect(service['elevatorPositions'][elevatorIndex]).toBe(targetFloor);
    expect(service['elevatorStatus'][elevatorIndex]).toBe(`Picking up passengers on floor ${targetFloor}`);

    //Ensure the elevator is set back to idle after 10 seconds (simulating passenger time)
    flush(); // Processes remaining timeouts
    expect(service['elevatorStatus'][elevatorIndex]).toBe('idle');
  }));

  it('should generate random request', () => {
    const spyHandleRequest = spyOn(service, 'handleRequest');
    
    service.generateRandomRequest().subscribe((request: Request) => {
      expect(request.floor).toBeGreaterThanOrEqual(1);
      expect(request.floor).toBeLessThanOrEqual(10);
      expect(['up', 'down']).toContain(request.direction); // direction should be 'up' or 'down'
    });
  
    expect(spyHandleRequest).toHaveBeenCalled();
  });
  
  
});

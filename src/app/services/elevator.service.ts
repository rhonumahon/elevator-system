import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Request } from '../models/elevator.model';

@Injectable({
  providedIn: 'root'
})
export class ElevatorService {
  private elevatorPositions: number[] = [1, 1, 1, 1]; // 4 elevators
  private elevatorStatus: string[] = ['idle', 'idle', 'idle', 'idle']; //initial status of the 4 elevators
  // stores floor requests, with the floor number as the key and the directions (up/down) as values.
  private floorRequests: { [key: number]: string[] } = {};
  // Stores generated elevator requests
  requests: Request[] = [];

  // Emits real-time updates on elevator status to subscribed components
  public elevatorStatusSubject = new BehaviorSubject<string[]>(this.getElevatorPositions());

  constructor() {
    // Starts updating the elevator statuses every second
    setInterval(() => this.updateElevatorStatusSubject(), 1000);
  }

  // Returns the current positions and statuses of the elevators
  getElevatorPositions(): string[] {
    return this.elevatorPositions.map((pos, idx) => `Car ${idx + 1} is on floor ${pos} - Status: ${this.elevatorStatus[idx]}`);
  }

  // This method is used by components to get the elevator status updates as an observable.
  getElevatorStatusObservable() {
    return this.elevatorStatusSubject.asObservable();
  }


  handleRequest(floor: number, direction: string): void {
    // Add the direction to the floor request queue
    if (!this.floorRequests[floor]) {
      this.floorRequests[floor] = [];
    }
    this.floorRequests[floor].push(direction); // Add the direction to the request for the floor

    // Assign the closest elevator to this request
    this.assignElevatorToRequest(floor, direction);
  }

  // Finds the closest available elevator for the requested floor and direction
  assignElevatorToRequest(floor: number, direction: string): void {
    let closestElevatorIndex = -1;
    let minDistance = Number.MAX_VALUE;

    // check each elevator to find the one that is closest to therequestd floor and idle
    for (let i = 0; i < this.elevatorPositions.length; i++) {
      const elevatorPosition = this.elevatorPositions[i];
      const distance = Math.abs(elevatorPosition - floor); // Calculate distance from current elevator position to requested floor

      //Select the closest elevator that is currently idle
      if (distance < minDistance && this.elevatorStatus[i] === 'idle') {
        minDistance = distance;
        closestElevatorIndex = i;
      }
    }

    //If a valid elevator was found, move it to the requested floor
    if (closestElevatorIndex !== -1) {
      this.moveElevator(closestElevatorIndex, this.elevatorPositions[closestElevatorIndex], floor);
    }
  }

  //Moves the selected elevator from its current position to the requested floor
  moveElevator(elevatorIndex: number, currentPosition: number, targetFloor: number): void {
    // Set the elevator's status to 'moving'
    this.elevatorStatus[elevatorIndex] = `Moving to floor ${targetFloor}`;

    const movementTime = 2; //movement speed: 2 seconds per floor
    const timeToMove = Math.abs(currentPosition - targetFloor) * movementTime; // Calculate total time to reach target floor

    // Simulate the movement delay using setTimeout
    setTimeout(() => {
      // After moving, update the elevator's position and set its status to "Picking up passengers"
      this.elevatorPositions[elevatorIndex] = targetFloor;
      this.elevatorStatus[elevatorIndex] = `Picking up passengers on floor ${targetFloor}`;
      
      // Simulate time for passengers to enter/exit the elevator
      setTimeout(() => {
        // Once passengers are picked up, reset the elevator to idle
        this.elevatorStatus[elevatorIndex] = 'idle';
        this.updateElevatorStatusSubject(); //update/notify all subscribers about the new status
      }, 10000); // 10 seconds to simulate passenger entry/exit
    }, timeToMove * 1000); // convert to milliseconds
  }

  // Notifies subscribers about updated elevator statuses by emitting the new positions
  private updateElevatorStatusSubject(): void {
    this.elevatorStatusSubject.next(this.getElevatorPositions());
  }

  //Generates a random floor request and calls the handleRequest method to assign an elevator
  generateRandomRequest(): Observable<Request> {
    //Generate a random floor between 1 and 10
    const randomFloor = Math.floor(Math.random() * 10) + 1;

    // Randomly select a direction: 'up' or 'down'
    const randomDirection: 'up' | 'down' = (Math.floor(Math.random() * 100) + 1) % 2 === 0 ? 'up' : 'down';

    // Create a request object with the random floor and direction
    const request: Request = { floor: randomFloor, direction: randomDirection };

    // Push the request to the request list
    this.requests.push(request);

    //Handles the request by assigning an elevator to it
    this.handleRequest(randomFloor, randomDirection);

    // Return the generated request as an observable
    return of(request);
  }
}

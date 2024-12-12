import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ElevatorService } from './services/elevator.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let elevatorServiceMock: jasmine.SpyObj<ElevatorService>;

  beforeEach(() => {
    //Create a mock for ElevatorService
    elevatorServiceMock = jasmine.createSpyObj('ElevatorService', ['getElevatorStatusObservable', 'handleRequest']);
    
    //Mock the getElevatorStatusObservable method to return a mocked observable
    elevatorServiceMock.getElevatorStatusObservable.and.returnValue(of(['Car 1 is on floor 1 - Status: idle', 'Car 2 is on floor 1 - Status: idle']));

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: ElevatorService, useValue: elevatorServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'elevator-system'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('elevator-system');
  });

  it('should call getElevatorStatusObservable on init', () => {
    component.ngOnInit();
    expect(elevatorServiceMock.getElevatorStatusObservable).toHaveBeenCalled();
  });

  it('should display elevator positions', () => {
    fixture.detectChanges();  // Trigger change detection
    const compiled = fixture.nativeElement;
    const elevatorStatusElements = compiled.querySelectorAll('.elevator-positions p');
    expect(elevatorStatusElements.length).toBe(2);  // There are 2 elevators
    expect(elevatorStatusElements[0].textContent).toContain('Car 1 is on floor 1 - Status: idle');
  });
});


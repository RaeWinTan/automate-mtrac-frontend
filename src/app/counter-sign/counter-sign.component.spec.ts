import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterSignComponent } from './counter-sign.component';

describe('CounterSignComponent', () => {
  let component: CounterSignComponent;
  let fixture: ComponentFixture<CounterSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterSignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

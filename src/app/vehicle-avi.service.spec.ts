import { TestBed } from '@angular/core/testing';

import { VehicleAviService } from './vehicle-avi.service';

describe('VehicleAviService', () => {
  let service: VehicleAviService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleAviService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

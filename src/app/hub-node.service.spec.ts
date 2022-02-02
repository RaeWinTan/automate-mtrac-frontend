import { TestBed } from '@angular/core/testing';

import { HubNodeService } from './hub-node.service';

describe('HubNodeService', () => {
  let service: HubNodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HubNodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

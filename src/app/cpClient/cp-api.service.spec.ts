import { TestBed } from '@angular/core/testing';

import { CpApiService } from './cp-api.service';

describe('CpApiService', () => {
  let service: CpApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CpApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

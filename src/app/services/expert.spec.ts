import { TestBed } from '@angular/core/testing';

import { Expert } from './expert';

describe('Expert', () => {
  let service: Expert;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Expert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

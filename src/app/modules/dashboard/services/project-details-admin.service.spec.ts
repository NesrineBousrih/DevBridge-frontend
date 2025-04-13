import { TestBed } from '@angular/core/testing';

import { ProjectDetailsAdminService } from './project-details-admin.service';

describe('ProjectDetailsAdminService', () => {
  let service: ProjectDetailsAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectDetailsAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

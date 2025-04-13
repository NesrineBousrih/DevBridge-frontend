import { TestBed } from '@angular/core/testing';
import { ProjectAdminService } from './project-admin.service';

describe('ProjectAdminService', () => {
  let service: ProjectAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

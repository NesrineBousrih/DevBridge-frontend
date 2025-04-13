import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameworkFormComponent } from './framework-form.component';

describe('FrameworkFormComponent', () => {
  let component: FrameworkFormComponent;
  let fixture: ComponentFixture<FrameworkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameworkFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrameworkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

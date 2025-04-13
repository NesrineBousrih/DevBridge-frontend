import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameworkDetailsComponent } from './framework-details.component';

describe('FrameworkDetailsComponent', () => {
  let component: FrameworkDetailsComponent;
  let fixture: ComponentFixture<FrameworkDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameworkDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrameworkDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

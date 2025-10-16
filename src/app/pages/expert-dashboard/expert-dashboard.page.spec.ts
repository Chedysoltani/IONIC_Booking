import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpertDashboardPage } from './expert-dashboard.page';

describe('ExpertDashboardPage', () => {
  let component: ExpertDashboardPage;
  let fixture: ComponentFixture<ExpertDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpertDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

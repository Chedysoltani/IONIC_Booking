import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChoixRegisterPage } from './choix-register.page';

describe('ChoixRegisterPage', () => {
  let component: ChoixRegisterPage;
  let fixture: ComponentFixture<ChoixRegisterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoixRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

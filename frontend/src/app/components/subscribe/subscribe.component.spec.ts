import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribePageComponent } from './subscribe.component';

describe('SubscribeComponent', () => {
  let component: SubscribePageComponent;
  let fixture: ComponentFixture<SubscribePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscribePageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscribePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

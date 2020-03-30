import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinechartLognComponent } from './linechart-logn.component';

describe('LinechartlognComponent', () => {
  let component: LinechartLognComponent;
  let fixture: ComponentFixture<LinechartLognComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinechartLognComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinechartLognComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

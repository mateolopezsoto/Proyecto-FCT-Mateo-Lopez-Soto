import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestablecerContrasinalComponent } from './restablecer-contrasinal.component';

describe('RestablecerContrasinalComponent', () => {
  let component: RestablecerContrasinalComponent;
  let fixture: ComponentFixture<RestablecerContrasinalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestablecerContrasinalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestablecerContrasinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

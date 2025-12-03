import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarRestablecimientoComponent } from './solicitar-restablecimiento.component';

describe('SolicitarRestablecimientoComponent', () => {
  let component: SolicitarRestablecimientoComponent;
  let fixture: ComponentFixture<SolicitarRestablecimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarRestablecimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarRestablecimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

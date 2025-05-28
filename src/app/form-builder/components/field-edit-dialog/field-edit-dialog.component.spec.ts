import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldEditDialogComponent } from './field-edit-dialog.component';

describe('FieldEditDialogComponent', () => {
  let component: FieldEditDialogComponent;
  let fixture: ComponentFixture<FieldEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldEditDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratedCodeComponent } from './generated-code.component';

describe('GeneratedCodeComponent', () => {
  let component: GeneratedCodeComponent;
  let fixture: ComponentFixture<GeneratedCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratedCodeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneratedCodeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('typescriptCode', 'script');
    fixture.componentRef.setInput('htmlCode', 'html');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

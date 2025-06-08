import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InputType } from '@models/input-type.model';
import { ButtonModule } from 'primeng/button';
import { InputSelectorComponent } from './input-selector.component';

describe('InputSelectorComponent', () => {
  let component: InputSelectorComponent;
  let fixture: ComponentFixture<InputSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonModule, FontAwesomeModule, InputSelectorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputSelectorComponent);
    fixture.componentRef.setInput('isMobile', false);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have inputConfigs mapped correctly', () => {
    expect(component.inputConfigs.length).toBe(component.inputTypes.length);

    component.inputConfigs.forEach((config) => {
      expect(config.name).toBeTruthy();
      expect(Object.values(InputType)).toContain(config.type);
      expect(config.icon).toBeDefined();
    });
  });

  it('should emit inputSelected when a button is clicked', () => {
    spyOn(component.inputSelected, 'emit');

    const buttons = fixture.debugElement.queryAll(By.css('.input-button'));
    expect(buttons.length).toBe(component.inputConfigs.length);

    buttons[0].nativeElement.click();
    expect(component.inputSelected.emit).toHaveBeenCalledWith(component.inputConfigs[0].type);
  });
});

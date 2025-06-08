import { Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalendar,
  faCheckSquare,
  faDotCircle,
  faFont,
  faHashtag,
  faKey,
  faXmark,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { InputType } from '@models/input-type.model';
import { ButtonModule } from 'primeng/button';

interface InputConfig {
  name: string;
  type: InputType;
  icon: IconDefinition;
}

@Component({
  selector: 'app-input-selector',
  imports: [ButtonModule, FontAwesomeModule],
  templateUrl: './input-selector.component.html',
  styleUrl: './input-selector.component.scss',
})
export class InputSelectorComponent {
  isMobile = input.required<boolean>();
  inputSelected = output<InputType>();
  close = output();

  //Icons
  faXmark = faXmark;
  iconMap: Record<InputType, IconDefinition> = {
    [InputType.TEXT]: faFont,
    [InputType.TEXTAREA]: faCalendar,
    [InputType.NUMBER]: faHashtag,
    [InputType.PASSWORD]: faKey,
    [InputType.CHECKBOX]: faCheckSquare,
    [InputType.RADIO]: faDotCircle,
    [InputType.DATE]: faCalendar,
    [InputType.GROUP]: faCalendar,
  };

  inputTypes = ['text', 'textarea', 'number', 'password', 'checkbox', 'radio', 'date'] as const;

  inputConfigs: InputConfig[] = this.inputTypes.map((type) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type: InputType[type.toUpperCase() as keyof typeof InputType],
    icon: this.iconMap[type as InputType],
  }));

  onInputSelected(type: InputType) {
    this.inputSelected.emit(type);
    this.close.emit();
  }
}

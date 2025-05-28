import { Component, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalendar,
  faCheckSquare,
  faDotCircle,
  faEnvelope,
  faFont,
  faHashtag,
  faKey,
  faStar,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { ButtonModule } from 'primeng/button';
import { InputType } from '../../../models/form.model';

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
  inputSelected = output<InputType>();

  iconMap: Record<InputType, IconDefinition> = {
    [InputType.TEXT]: faFont,
    [InputType.TEXTAREA]: faCalendar,
    [InputType.NUMBER]: faHashtag,
    [InputType.EMAIL]: faEnvelope,
    [InputType.PASSWORD]: faKey,
    [InputType.CHECKBOX]: faCheckSquare,
    [InputType.RADIO]: faDotCircle,
    [InputType.DATE]: faCalendar,
  };

  // 4. Source array
  inputTypes = ['text', 'textarea', 'number', 'email', 'password', 'checkbox', 'radio', 'date'] as const;

  // 5. Create the array of objects
  inputConfigs: InputConfig[] = this.inputTypes.map((type) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type: InputType[type.toUpperCase() as keyof typeof InputType],
    icon: this.iconMap[type as InputType],
  }));
}

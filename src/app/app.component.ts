import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { HeaderComponent } from './header/header.component';
import { DividerModule } from 'primeng/divider';
import { GeneratedCodeComponent } from './generated-code/generated-code.component';
import { CodeGeneratorService } from '@core/services/code-generator.service';
import { FormDefinition } from '@models/form-definition.model';
import { TabsModule } from 'primeng/tabs';
import { InputSelectorComponent } from './input-selector/input-selector.component';
import { InputType } from '@models/input-type.model';

@Component({
  selector: 'app-root',
  imports: [
    FormBuilderComponent,
    HeaderComponent,
    DividerModule,
    GeneratedCodeComponent,
    TabsModule,
    InputSelectorComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly codeGeneratorService = inject(CodeGeneratorService);

  title = 'Form Builder';

  typescriptCode = signal<string>('');
  htmlCode = signal<string>('');

  fieldTypeToAdd = signal<InputType | null>(null);

  screenWidth = signal(window.innerWidth);
  isMobile = computed(() => this.screenWidth() < 992);

  constructor() {
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
    });
  }

  onInputSelected(type: InputType) {
    this.fieldTypeToAdd.set(type);
  }

  onFormChange(form: FormDefinition) {
    this.typescriptCode.set(this.codeGeneratorService.generateTypescriptCode(form));
    this.htmlCode.set(this.codeGeneratorService.generateHTMLTemplate(form));
  }
}

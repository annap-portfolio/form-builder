import { Component } from '@angular/core';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { HeaderComponent } from './header/header.component';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-root',
  imports: [FormBuilderComponent, HeaderComponent, DividerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'form-builder';
}

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAlignLeft, faBars } from '@fortawesome/free-solid-svg-icons';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  imports: [FontAwesomeModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  title = input.required<string>();
  isMobile = input.required<boolean>();
  openSidebar = output();

  // Icons
  faAlignLeft = faAlignLeft;
  faBars = faBars;

  onOpenSidebar() {
    this.openSidebar.emit();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteTeamDialogData {
  teamName: string;
}

@Component({
  selector: 'app-delete-team-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './delete-team-dialog.html',
  styleUrl: './delete-team-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteTeamDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<DeleteTeamDialogComponent>,
  );

  readonly data = inject<DeleteTeamDialogData>(
    MAT_DIALOG_DATA,
  );

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}

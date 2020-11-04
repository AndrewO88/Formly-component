import {Component, OnDestroy, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {startWith} from 'rxjs/operators';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'formly-field-exporting',
  template: `

    <div>
      <mat-checkbox [ngModelOptions]="{standalone: true}" (change)="onChange()" [(ngModel)]="show">{{to.label}}</mat-checkbox>
    </div>

    <form *ngIf="show" [formGroup]="exportForm">
      <div class="container">
        <div>
          <mat-form-field appearance="fill">
            <mat-label>{{to.imgLabel}}</mat-label>
            <mat-select formControlName="image" multiple [compareWith]="compare">
              <mat-option *ngFor="let img of to.imgOpt" [value]="img">{{img.label }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div>
          <mat-form-field appearance="fill">
            <mat-label>{{to.dataLabel}}</mat-label>
            <mat-select formControlName="data" multiple [compareWith]="compare">
              <mat-option *ngFor="let data of to.dataOpt" [value]="data">{{data.label}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div>
          <mat-form-field appearance="fill">
            <mat-label>{{to.printLabel}}</mat-label>
            <mat-select formControlName="print" multiple [compareWith]="compare">
              <mat-option *ngFor="let print of to.printOpt" [value]="print">{{print.label}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </form>

  `
})


export class FormlyExportingTypeComponent extends FieldType implements OnInit, OnDestroy {

  show = false;
  exportForm: FormGroup = new FormGroup({
    image: new FormControl([]),
    data: new FormControl([]),
    print: new FormControl([])
  });


  exporting$: Observable<Exporting>;

  private _subscriptions: Subscription[] = [];

  constructor(
    private _translate: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.exporting$ = this.formControl.valueChanges.pipe(
      startWith(this.field?.model?.chart?.exporting ? {
        menu: {
          items: [{
            label: '...',
            menu: [
              {
                label: this._translate.instant('Image'),
                menu: this.formControl.value?.menu?.items[0]?.menu[0].menu || []
              },
              {
                label: this._translate.instant('Data'),
                menu: this.formControl.value?.menu?.items[0]?.menu[1].menu || []
              },
              {
                label: this._translate.instant('Print'),
                menu: this.formControl.value?.menu?.items[0]?.menu[2].menu || []
              }
            ]
          }]
        }
      } : null)
    );


    this._subscriptions.push(
      this.exporting$.subscribe((exporting) => {
        this.show = !!exporting;

        this.exportForm.setValue({
          image: exporting?.menu?.items[0]?.menu[0]?.menu || [],
          data: exporting?.menu?.items[0]?.menu[1]?.menu || [],
          print: exporting?.menu?.items[0]?.menu[2]?.menu || []
        }, {emitEvent: false});
      }),

      this.exportForm.valueChanges.subscribe(_ => {
        if (this.show) {
          this.formControl.setValue({
            menu: {
              items: [{
                label: '...',
                menu: [
                  {
                    label: this._translate.instant('Image'),
                    menu: this.exportForm.value.image
                  },
                  {
                    label: this._translate.instant('Data'),
                    menu: this.exportForm.value.data
                  },
                  {
                    label: this._translate.instant('Print'),
                    menu: this.exportForm.value.print
                  }
                ]
              }]
            }
          });
        }
      })
    );

  }

  compare(val1, val2) {
    return val1?.type === val2?.type;
  }

  ngOnDestroy() {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }

  onChange() {
    if (!this.show) {
      this.formControl.setValue(null);
    }
  }
}

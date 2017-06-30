import * as moment from 'moment';
import { Component, ViewChildren, QueryList, ElementRef, ViewChild, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PickerController, PickerColumn, Picker } from 'ionic-angular';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                    'August', 'September', 'October', 'Novermber', 'December']

interface IEventMapping {
  month: number;
  monthName: string;
  days: number[];
  dates: Date[];
}

interface IEventMappings {
  [key: number] : IEventMapping;
}

@Component({
  selector: 'ionic-conference-calendar-header',
  template: `
<div class="header-calendar-wrapper">

  <div (click)="openDatePicker()">
    <div class="month">{{getMonthName(activeMonth)}}</div>
  </div>

  <div #dayWrapper class="day-wrapper">

    <div #daySlider
          [style.width]="getSliderWidth() + 'px'"
          class="day-slider">

      <div class="day-slider-padding"></div>

      <div #day 
            *ngFor="let d of getDaysInMonth(activeMonth)"
            [ngClass]="{active: d == activeDay}"
            (click)="setActiveDay(d)"
            class="day">{{d}}</div>

      <div class="day-slider-padding"></div>
            
    </div>

  </div>

</div>
`
})
export class IonicConferenceCalendarHeader {

  private margin: number = 0.5;

  private dayWidth: number = 64;

  private eventMappings: IEventMappings = {};

  public sliderWidth: number;

  public activeMonth: number;

  public activeDay: number;

  @Output('change') change = new EventEmitter<string | Date>();

  @Input('dates') dates: Array<string | Date> = [];

  @Input('date') date: string | Date;

  @ViewChild('dayWrapper') dayWrapper: ElementRef;

  @ViewChild('daySlider') daySlider: ElementRef;

  @ViewChildren('day') days: QueryList<ElementRef>;

  constructor(private pickerController: PickerController) {
    
  }

  public ngOnChanges(changes: SimpleChanges) {
    var activeDateChanged = false;
    var datesChanged = false;

    if(changes.dates) {
      this.initEventMappings();
      datesChanged = true;
    }

    if(changes.date && changes.date.previousValue !== changes.date.currentValue) {
      if(this.dates.length) {
        this.setActiveDate(changes.date.currentValue);
        activeDateChanged = true;
      }
    }

    if(datesChanged && !activeDateChanged) {
      this.setActiveMonth(+Object.keys(this.eventMappings)[0]);
    }
  }

  public getSliderWidth(): number {
    var dayWrapperWidth = (<HTMLDivElement>this.dayWrapper.nativeElement).offsetWidth;

    var numDays = this.getDaysInMonth(this.activeMonth).length;

    return Math.max((dayWrapperWidth + this.dayWidth+(this.dayWidth*this.margin)) * numDays);
  }

  private initEventMappings() {
    this.eventMappings = {};

    this.dates.forEach((dt) => {
      var date = moment(dt);

      var month = date.month();
      var monthName = monthNames[month];

      if(!this.eventMappings[month]) {
        this.eventMappings[month] = {
          month: month,
          monthName: monthName,
          days: [],
          dates: []
        };
      }

      this.eventMappings[month].dates.push(date.toDate());
    });

    for(var key in this.eventMappings) {
      var month = this.eventMappings[key];
      
      month.dates.forEach((dt) => {
        var day = moment(dt).date();

        if(month.days.indexOf(day) == -1) {
          month.days.push(day);
        }
      });

      month.days = month.days.sort();
    }
  }

  public getDaysInMonth(m: number) : number[] {
    if(this.eventMappings[m]) {
      return this.eventMappings[m].days;
    }
    
    return [];
  }

  public setActiveDate(d: string | Date, emitChange: boolean = true) {
    var dt = moment(d);

    this.activeMonth = dt.utc().month();
    this.setActiveDay(dt.utc().date(), emitChange);
  }

  public setActiveMonth(m: number, emitChange: boolean = true) {
    this.activeMonth = m;
    this.setActiveDay(this.getDaysInMonth(m)[0], emitChange);
  }

  public setActiveDay(d: number, emitChange: boolean = true) {
    this.activeDay = d;

    if(this.days) {
      var idx = this.eventMappings[this.activeMonth].days.indexOf(d);
      var day = this.days.toArray()[idx];

      (<HTMLDivElement>day.nativeElement).scrollIntoView({
        behavior: 'smooth'
      });
    }

    if(emitChange) {
      var now = moment();
      
      now.month(this.activeMonth);
      now.date(this.activeDay);
      now.hours(0);
      now.minutes(0);
      now.seconds(0);
      now.milliseconds(0);
      
      this.change.emit(now.utc().toDate());
    }
  }

  public getMonthName(m: number) {
    return monthNames[m];
  }

  public openDatePicker() {
    var monthColumn: PickerColumn = {
      name: 'Month',
      align: 'center',
      options: []
    };

    for(var key in this.eventMappings) {
      var mapping = this.eventMappings[key];

      var month = mapping.month;
      var monthName = mapping.monthName;

      monthColumn.options.push({
        value: month,
        text: monthName
      });
    }

    var picker = this.pickerController.create({
      columns: [
        monthColumn
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Done',
          handler: (data: any) => {
            this.setActiveMonth(data.Month.value);
          }
        }
      ]
    });

    picker.present();
    picker.enableBack();
  }
}
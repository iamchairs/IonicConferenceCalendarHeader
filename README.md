# Ionic Conference Calendar Header

A sweet conference style calendar.

![default days view](https://github.com/iamchairs/ionic-conference-calendar-header/raw/master/ioniceventheader.gif "demo")

![months view](https://github.com/iamchairs/ionic-conference-calendar-header/raw/master/ioniceventheadermonths.gif "demo")


## Setup


Install


```
npm install ionic-conference-calendar-header
```

Add component to declarations



```
import { IonicConferenceCalendarHeader } from 'ionic-conference-calendar-header'

@NgModule({
  declarations: [
    IonicConferenceCalendarHeader
  ]
})
export class AppModule {}
```

Add to your page

```
<!-- pretty-header is what gives it that gradient. that's not part of the component -->
<ion-header class="pretty-header">
  <ion-navbar>
    <button ion-button menuToggle>
      <ion-icon name="menu"></ion-icon>
    </button>
  </ion-navbar>

  <ionic-conference-calendar-header (change)="onDateChanged($event)"
                                    [date]="activeDate"
                                    [dates]="eventDates">
  </ionic-conference-calendar-header>
</ion-header>
```

Import the stylesheet

(this changes the selected date color to your primary color)

```
@import '../node_modules/ionic-conference-calendar-header/src/ionicConferenceCalendarHeader.component.scss';
```

## API

|          | Name   | Data Type            | Description                                                                                           | Example                                              |
|----------|--------|----------------------|-------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| [Input]  | date   | string \| Date        | The date to select in the header. The date must already exist in the given [dates].                   | "2018-01-01" | new Date()                            |
| [Input]  | dates  | Array\<string \| Date\> | All of the possible dates.                                                                            | ["2018-01-01", "2018-01-02", new Date(), new Date()] |
| [Input]   | view  | string | Optional view type setting. Possible values are "days" and "months". Defaults to **days** | "days" | "months" |
| (Output) | change | string                |  | "2018-01-01"                                                     |
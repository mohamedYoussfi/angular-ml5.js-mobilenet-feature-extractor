import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
declare let ml5: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  public mobileNetFeatureExtractor;
  public featureClassifier;
  public label;
  public confidence;
  public newLabel;
  public currentProgress = 0;
  public loss: number;
  public iteration: number;
  @ViewChild('video')  public video: ElementRef;
  @ViewChild('canvas')  public canvas: ElementRef;
  public captures: Array<any>;
  constructor(private zone: NgZone) {
    this.captures = [];
  }
  ngOnInit(): void {
     this.mobileNetFeatureExtractor = ml5.featureExtractor('MobileNet', () => {
      this.featureClassifier = this.mobileNetFeatureExtractor.classification(this.video.nativeElement, () => {
        console.log('Vidéo ready');
      });
    });
  }
  addImage() {
    this.featureClassifier.addImage(this.newLabel);
    this.capture();
  }
  train() {
    this.iteration = 0; this.loss = 0;
    this.currentProgress = 0;
    this.featureClassifier.train((loss) => {
      if (loss == null) {
        this.iteration = 100;
        this.mobileNetFeatureExtractor.classify((e, r) => {
          this.gotResults(e, r);
        });
      } else {
        this.zone.run(() => {
          ++this.currentProgress;
          ++this.iteration;
          this.loss = loss;
        });
      }
    });
  }
  public ngAfterViewInit() {
    console.log(webkitURL);
    if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
      });
    }
  }

  public capture() {
    const context = this.canvas.nativeElement.getContext('2d').drawImage(this.video.nativeElement, 0, 0, 320, 240);
    this.captures.push(this.canvas.nativeElement.toDataURL('image/png'));
  }

  gotResults(err, results) {
    if (err) {
      console.log(err);
    } else {
      this.zone.run(() => {
        this.label = results[0].label;
        this.confidence = results[0].confidence;
      });
      this.mobileNetFeatureExtractor.classify((e, r) => {
        this.gotResults(e, r);
      });
    }
  }

}

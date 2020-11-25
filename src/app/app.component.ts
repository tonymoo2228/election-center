import { Component, OnInit } from '@angular/core';
import { HostListener } from "@angular/core";
import * as electionsInfoJSON from '../assets/elections_info.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public currentCandidates: any[];
  public currentElection: any;

  public elections: any[];
  public electionLink: string;

  public percentages;

  public selectedCandidate: boolean = false;
  public currentCandidate;
  public currentCandidateLink: string = 'N/A';

  constructor( ) { }

  ngOnInit( )
  {
    this.elections = electionsInfoJSON.elections;
    this.currentElection = this.elections[0];

    this.electionLink = 'https://en.wikipedia.org/wiki/' + this.currentElection.year + '_United_States_presidential_election'

    this.setCurrentCandidates();
    this.currentCandidate = this.currentElection.candidates[0];
    this.onResize();
  }


  /*
    Controls related to resizing the pie-chart.
    Sets it to 1/3rd of the screen size in both heigh and width.
  */
  public screenHeight: number;
  public screenWidth: number;
  public view: number[];

  @HostListener('window:resize', ['$event'])
  onResize()
  {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    this.view = [ this.screenWidth / 3, this.screenHeight / 3 ];
  }

  public setCurrentCandidates()
  {
    this.currentCandidates = [];

    let totalVotes = 0;
    this.currentElection.candidates.forEach(candidate =>
    {
      if (+candidate.votes.replace(/,/g, '') > 0)
      {
        totalVotes += (+candidate.votes.replace(/,/g, ''));
      }
    });

    this.currentElection.candidates.forEach(candidate =>
    {
      if (+candidate.votes.replace(/,/g, '') > 0)
      {
        this.currentCandidates.push(
        {
          name: candidate.name.substring(candidate.name.lastIndexOf(' ') + 1,candidate.name.length),
          value: +candidate.votes.replace(/,/g, ''),
          party: candidate.party,
          fullName: candidate.name,
          percent: ((+(candidate.votes.replace(/,/g, '')) / totalVotes) * 100).toFixed(2)
        });
      }
    });
  }

  changeYear( )
  {
    this.selectedCandidate = false;
    const newYear = ((document.getElementById("election_years") as HTMLInputElement).value);
    this.elections.forEach( election => {
      if ( election.year == newYear ) this.currentElection = election;
    });

    this.electionLink = 'https://en.wikipedia.org/wiki/' + this.currentElection.year + '_United_States_presidential_election'
    this.setCurrentCandidates();
  }

  onSelect( selectedName )
  {
    this.selectedCandidate = true;
    this.currentElection.candidates.forEach(candidate => {
      if ( candidate.name.substring(candidate.name.lastIndexOf(' ') + 1, candidate.name.length) == selectedName.name )
      {
        this.currentCandidate = candidate;
        this.currentCandidateLink = "https://en.wikipedia.org" + candidate.link;
      }
    });
  }
}



import { Component, OnInit } from '@angular/core';
import * as default_map from '../assets/test.json';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public elections;
  public election_link: string;
  public current_election;
  public data;
  public percentages;

  public selected_candidate: boolean = false;
  public current_candidate;
  public current_candidate_link: string = 'N/A';

  public voters: boolean = true;

  public chart_types;
  public chart_type;

  saleData: any;

  constructor( ) { }

  ngOnInit( )
  {
    const xAxisData = [];
    const data1 = [];
    const data2 = [];

    this.saleData = [
      { name: "Mobiles", value: 105000 },
      { name: "Laptop", value: 55000 },
      { name: "AC", value: 15000 },
      { name: "Headset", value: 150000 },
      { name: "Fridge", value: 20000 }
    ];



    this.chart_types = ['Popular Vote', 'Electoral Vote'];
    this.chart_type = 'Popular Vote';

    this.elections = default_map.elections;
    this.current_election = this.elections[0];
    this.election_link = 'https://en.wikipedia.org/wiki/' + this.current_election.year + '_United_States_presidential_election'

    this.setData();
    this.current_candidate = this.current_election.candidates[0];
  }

  setData()
  {
    this.data = [ ];
    
    let total_votes = 0;
    this.current_election.candidates.forEach(candidate =>
    {
      if (+candidate.votes.replace(/,/g, '') > 0) 
      {
        this.data.push({ name: candidate.name.substring(candidate.name.lastIndexOf(' ') + 1, candidate.name.length), value: +candidate.votes.replace(/,/g, '') })
        total_votes += (+candidate.votes.replace(/,/g, ''));
      }
    });

    console.log(this.data)




      // if (this.chart_type == 'Popular Vote')
      //   this.data.push(
      //     { Value: +candidate.votes.replace(/,/g, ''), Label: candidate.name.substring(candidate.name.lastIndexOf(' '), candidate.name.length), Label2: candidate.name + ' (' + candidate.party + ')', Label3: candidate.name  }
      //   );
      // else
      //   this.data.push(
      //     { Value: +candidate.electors.replace(/,/g, ''), Label: candidate.name.substring(candidate.name.lastIndexOf(' '), candidate.name.length), Label2: candidate.name + ' (' + candidate.party + ')', Label3: candidate.name }
      //   );
      //   if (+candidate.votes.replace(/,/g, '') > 0) total_votes += (+candidate.votes.replace(/,/g, ''));
      // });

      this.percentages = [];
      this.current_election.candidates.forEach(candidate => {
        if (+candidate.votes.replace(/,/g, '') > 0) 
          this.percentages.push(
            { name: candidate.name, party: candidate.party, percent: ((+(candidate.votes.replace(/,/g, '')) / total_votes) * 100).toFixed(2), votes: candidate.votes }
          );

        });


  }

  changeYear( )
  {
    this.selected_candidate = false;
    const new_year = ((document.getElementById("election_years") as HTMLInputElement).value);
    this.elections.forEach( election => {
      if ( election.year == new_year ) this.current_election = election;
    });

    this.election_link = 'https://en.wikipedia.org/wiki/' + this.current_election.year + '_United_States_presidential_election'
    this.setData();
  }

  changeType()
  {
    const new_type = ((document.getElementById("chart_types") as HTMLInputElement).value);
    this.chart_type = new_type;

    this.setData();
  }

  onSelect(data): void {
    console.log("Item clicked", JSON.parse(JSON.stringify(data)));

    this.selected_candidate = true;
    this.current_election.candidates.forEach(candidate => {
      if ( candidate.name.substring(candidate.name.lastIndexOf(' ') + 1, candidate.name.length) == data.name || candidate.name.substring(candidate.name.lastIndexOf(' ') + 1, candidate.name.length) == data)
      {
        this.current_candidate = candidate;
        this.current_candidate_link = "https://en.wikipedia.org" + candidate.link;
      }
    });

  }
}



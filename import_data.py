import requests
from bleach import clean
import json

def strip_html(src, allowed=['p']):
    cleaned = clean(src, tags=allowed, strip=True, strip_comments=True)
    while '&#91;' in cleaned:
        cleaned = cleaned[:cleaned.index('&#91;')] + cleaned[cleaned.index('&#93;') + len('&#93;'):]
    return cleaned

class Elections:

    def __init__(self, elections):
        self.elections = [ i.__dict__ for i in elections ]

class Election:

    def __init__(self, year, candidates, blurb, winner):
        self.year = year
        self.candidates = [ i.__dict__ for i in candidates ]
        self.blurb = blurb
        self.winner = winner

class Candidate:

    def __init__(self, name, link, party, electors, votes):
        self.name = name
        self.link = link
        self.party = party
        self.electors = electors
        self.votes = votes

    def setBlurb(self, blurb):
        self.blurb = blurb

def parseCandidateBlurb( website_text, is_debs ):
    foundParagraph = False
    blurb = ''
    if is_debs:
        p_count = 0
        for line in website_text.split('\n'):
            if '<p>' in line and '<p><a ' not in line and '<p><img ' not in line: p_count += 1
        
            if p_count >= 5:
                if '<p>' in line and '<p><a ' not in line and '<p><img ' not in line: foundParagraph = True
                elif foundParagraph == False: continue

                if '<style' in line or '<div' in line:
                    return blurb

                blurb += line

    for line in website_text.split('\n'):
        if '<p>' in line and '<p><a ' not in line and '<p><img ' not in line: foundParagraph = True
        elif foundParagraph == False: continue

        if '<style' in line or '<div' in line:
            return blurb

        blurb += line

if __name__ == '__main__':

    elections = []
    # Start after Washington's terms because he ran unopposed.
    current_election = 1796
    while current_election <= 2016:
        election_url = 'https://en.wikipedia.org/wiki/' + str(current_election) + '_United_States_presidential_election'
        website_text = requests.get(election_url).text

        signals_to_data = {}

        body_count = 0
        signal = 'N/A'

        is_blurb = False
        more_blurb = True
        blurb = ''
        get_winner = False
        winner = 'N/A'
        for line in website_text.split('\n'):
            if 'tbody' in line:
                body_count += 1
            if body_count < 3:
                continue
            if body_count > 3 and more_blurb:
                if '<p>' in line and '<p><a href' not in line:
                    is_blurb = True
                    blurb += line
            if is_blurb:
                if '<div ' in line:
                    more_blurb = False

            if get_winner:
                winner = line[line.index('">') + 2: line.index('</a>')]
                get_winner = False

            if signal != 'N/A':
                if '</tr>' in line:
                    signal = 'N/A'
                elif '<td' in line and 'width' in line:
                    if signal == 'Nominee':
                        data = line[line.index('title="') + 7: line.index('">', line.index('title="'))]
                        if '('  in data: data = data[:data.index('(')-1]
                        if signal not in signals_to_data: signals_to_data[signal] = [data]
                        else: signals_to_data[signal].append(data)
                        
                        if 'Link' not in signals_to_data: signals_to_data['Link'] = []
                        data = line[ line.index('<a href="') + len('<a href="') : line.index('" title="') ]
                        signals_to_data['Link'].append(data)

                    if signal == 'Party':
                        data = line[line.index('title="') + 7: line.index('">', line.index('title="'))]
                        if '('  in data: data = data[:data.index('(')-1]
                        if signal not in signals_to_data: signals_to_data[signal] = [data]
                        else: signals_to_data[signal].append(data)

                    if signal == 'Popular vote':
                        if '<sup id' in line:
                            data = line[line.index(':center">') + len(':center">'): line.index('<sup id', line.index(':center">'))]
                        else:
                            data = line[line.index(':center">') + len(':center">'):]
                        if '<b>' in data:
                            data = data[3:-4]
                        if signal not in signals_to_data: signals_to_data[signal] = [data]
                        else: signals_to_data[signal].append(data)
                    if signal == 'Electoral vote':
                        data = line[line.index('n:center">') + len('n:center">'):]
                        if '<b>' in data:
                            data = data[3:-4]
                        if signal not in signals_to_data: signals_to_data[signal] = [data]
                        else: signals_to_data[signal].append(data)

                    #else:
                        #print(line)

            if '<th' in line:
                signal = line.split('>')[1].replace('&#160;', ' ')

            if 'Elected President' in line and winner == 'N/A':
                get_winner = True

        candidates = []
        for i in range(len(signals_to_data['Nominee'])):
            new_candidate = Candidate( signals_to_data['Nominee'][i], signals_to_data['Link'][i], signals_to_data['Party'][i], signals_to_data['Electoral vote'][i], signals_to_data['Popular vote'][i] )
            
            candidate_url = 'https://en.wikipedia.org' + signals_to_data['Link'][i]
            candidate_text = requests.get(candidate_url).text
            new_candidate.blurb = strip_html(parseCandidateBlurb(candidate_text, new_candidate.name == 'Eugene V. Debs'))

            print(new_candidate.name)
            print(new_candidate.blurb)
            
            candidates.append(new_candidate)
        
        new_election = Election(current_election, candidates, strip_html(blurb), winner)
        elections.append(new_election)
        current_election += 4

    elections_obj = Elections(elections)

    with open('test.json', 'w') as ofile:
        ofile.write(json.dumps(elections_obj.__dict__))


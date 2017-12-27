# Scrapes basketball-reference for all NBA/ABA player information
# Run using "python data_scraper.py"

from bs4 import BeautifulSoup
import urllib, time, csv

def getURL(alphabet):
    return "https://www.basketball-reference.com/players/" + alphabet + "/"

def getHtml(urlString):
    return urllib.urlopen(urlString).read()

def getSoup(htmlString):
    return BeautifulSoup(htmlString, 'html.parser')

def preprocess_height(height):
    height = height.split('-')
    print height
    feet = height[0]
    inches = height[1]
    return int(feet)*12 + int(inches)

def get_player_data(player):
    name = p.find('a').text.strip().encode('ascii', 'ignore')
    year_start = p.find('td', attrs={"data-stat": "year_min"}).text.strip().encode('ascii', 'ignore')
    year_end = p.find('td', attrs={"data-stat": "year_max"}).text.strip().encode('ascii', 'ignore')
    position = p.find('td', attrs={"data-stat": "pos"}).text.strip().encode('ascii', 'ignore')
    height = p.find('td', attrs={"data-stat": "height"}).text.strip().encode('ascii', 'ignore')
    weight = p.find('td', attrs={"data-stat": "weight"}).text.strip().encode('ascii', 'ignore')

    try: #Some bday data not available, sounds like some illuminati to me
        birth_date = p.find('td', attrs={"data-stat": "birth_date"}).find('a').text.strip().encode('ascii', 'ignore')
    except AttributeError:
        birth_date = ""
    
    try: #Some college data not available
        college = p.find('td', attrs={"data-stat": "college_name"}).find('a').text.strip().encode('ascii', 'ignore')
    except AttributeError:
        college = ""
    
    if (height): height = preprocess_height(height)

    return (name, year_start, year_end, position, height, weight, birth_date, college)

def write_to_csv(filename, data):
    with open(filename, 'wb') as out:
        csv_out = csv.writer(out)
        csv_out.writerow(['name','year_start','year_end','position','height','weight','birth_date', 'college'])
        for row in data:
            csv_out.writerow(row)

if __name__ == "__main__":

    data = []
    # No player with 'x' last name, xavier where u at?
    alphabet_list = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','y','z']

    for alphabet in alphabet_list:
        time.sleep(1) #Lets be good people, we don't want to take down a website
        url = getURL(alphabet)
        html = getHtml(url)
        soup = getSoup(html)

        group = soup.find('tbody')
        player = group.findAll('tr')
        
        for p in player:
            player_data = get_player_data(p)
            data.append(player_data)
        
    write_to_csv('../data/player_data.csv', data)




    
    

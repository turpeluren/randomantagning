from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
#from selenium.webdriver.chrome.service import Service
#from webdriver_manager.chrome import ChromeDriverManager
import chromedriver_autoinstaller
#from webdriver_manager.chrome import ChromeDriverManager
import sys
import math
import json

# Program for scraping courses from randomantagning.se
# Run with py webscraper.py [startsemester] [nr of semesters to scrape]

antagningar = []

#browser = webdriver.Chrome(executable_path='C:/cygwin64/home/c23tgl/randomantagning.se/chromedriver.exe')

# automatically get latest chromedriver
chromedriver_autoinstaller.install()
browser = webdriver.Chrome()

#start at first resultspage
#period 19 = VT 24
semester = 19
scrape_n_semesters = 4 # Default is to scrape 4 semesters

# Get command line arguments
if len(sys.argv) > 1:
    # We have arguments
    # Argument 1 is the semester
    semester = int(sys.argv[1])
    # Argument 2 is how many semesters to do
    if len(sys.argv) > 2: scrape_n_semesters = int(sys.argv[2])


for i in range(scrape_n_semesters):

    #open url
    url = 'https://www.antagning.se/se/search?period='+ str(semester) + '&sortBy=nameDesc&numberOfFetchedPages=' + str(1) #pagenumber
    browser.get(url)

    #pages = 140 #323 x 50 = 16150
    total_results = browser.find_element(By.CLASS_NAME, "searchresult_summary").text
    total_results = total_results.split()[1] + total_results.split()[2] # They separated it like 16 150
    total_results = int(''.join([i for i in total_results if i.isdigit()])) # Only take the digits in case its below 1000
    pages = math.ceil(total_results / 50)

    print('pages: '+str(pages))
    print('saved pages: ', end="")

    # Create the file
    with open('antagningar'+str(semester)+'.json', 'w', encoding='utf-8') as f:
        json.dump({"courses": total_results}, f, ensure_ascii=False, indent=4)

    #loop through all pages necessary
    #50 resultat per page
    for pagenr in range(pages):

        #choose latest resultsection element
        #and pick out the resultcards
        resultsections = browser.find_elements(By.CLASS_NAME, "resultsection")
        resultcards = resultsections[pagenr].find_elements(By.CLASS_NAME, "searchresultcard")

        page_jsondata = {}

        #get the data from the resultcards
        #append to antagningar array and antagningartext
        antagningartext = ""
        for i, card in enumerate(resultcards):
            #copy the elements from the card
            title = card.find_element(By.CLASS_NAME, "headline4").text
            title = title.replace("'", "´")
            hp = card.find_element(By.CLASS_NAME, "universal_medium").text
            #dot = card.find_ement(By.CLASS_NAME, "applicable_status").find_element(By.TAG_NAME, "span").get_attribute("class")
            periodElement = card.find_element(By.CLASS_NAME, "applicable_status")
            period = periodElement.text
            dot = periodElement.find_element(By.TAG_NAME, "span").get_attribute("class")
            info = str(card.find_element(By.CLASS_NAME, "resultcard_expanded").get_attribute("innerHTML"))
            info = info.replace("\n", "")
            info = info.replace("Kurs,", "Kurs, ")
            info = info.replace("Program,", "Program, ")
            info = info.replace("'", "´")
            info = info.replace('"', "'")
            info = ''.join(info.split()) # Join extra whitespace
            info = info.replace("/sv/static/behorighet", "https://www.antagning.se/sv/betyg-och-behorighet/behorighet/")
            link = card.find_element(By.CLASS_NAME, "external").get_attribute("href")

            jsondata = {
                "title": title,
                "hp": hp,
                "dot": dot,
                "period": period,
                "info": info,
                "link": link
            }

            page_jsondata[str(pagenr*50 + i)] = jsondata

            #antagningar.append([title, hp, link])

            #antagningartext += '"'+str(pagenr*50 + i)+'":' + '{"title": "' + title + '", "hp": "'+ hp + '", "dot": "'+ dot + '", "period": "' + period + '", "info": "' + info + '", "link": "' + link + '"}'
            #if not (pagenr == pages-1 and i == len(resultcards)-1):
            #   antagningartext += ',\n'
            #print(antagningartext)

        with open('antagningar'+str(semester)+'.json', 'r', encoding='utf-8') as f:
            file_data = json.load(f)
            file_data.update(page_jsondata)

        with open('antagningar'+str(semester)+'.json', 'w', encoding='utf-8') as f:
            json.dump(file_data, f, ensure_ascii=False, indent=4)

        # Print nr of the page that was just saved
        print(str(pagenr*50 + i), end=",")

        #write section to text file
        #f = open("antagningar"+str(semester)+".json", "a", encoding="utf-8")
        #if pagenr == 0:
        #    f.write("{\n")
        #f.write(antagningartext)
        #if pagenr == pages-1:
        #    f.write("\n}")
        #f.close()
            
        # Don't try to go to next page when already at the last page
        if pagenr < pages - 1:

            #click the show more hits button when it loads
            WebDriverWait(browser, 100).until(EC.element_to_be_clickable((By.NAME, "showmorehits"))).click()

            #showmorehits = browser.find_element(By.NAME, "showmorehits")
            #showmorehits.click()

            while browser.current_url[-len(str((pagenr+2))):] != str(pagenr+2):
                #wait until page loads
                pass

    # Move on to next semester
    print('finished semester '+str(semester))
    semester += 1


    #antagningartext = ""
    #for ant in antagningar:
    #    antagningartext += ant[0] + ': ' + ant[1] + '\n'

    #f = open("antagningar.txt", "w")
    #f.write(antagningartext)
    #f.close()





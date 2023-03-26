import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome import options
import undetected_chromedriver as uc
import time

def displayNotification(message,title=None,soundname=None):
	titlePart = 'with title "{0}"'.format(title)
	soundnamePart = 'sound name "{0}"'.format(soundname)
	appleScriptNotification = 'display notification "{0}" {1} {2} {3}'.format(message,titlePart,'',soundnamePart)
	os.system("osascript -e '{0}'".format(appleScriptNotification))

def logIn():
	driver.find_element(By.XPATH, "/html/body/form/div[3]/div/div[1]/div/div/div/div[3]/div/div[2]/span[2]/a").click()
	time.sleep(5)

	driver.find_element(By.XPATH, "//*[@id=\"username\"]").send_keys("guillin_ml@hotmail.com")
	driver.find_element(By.XPATH, "//*[@id=\"password-container\"]").send_keys("@SternDesSudens04")
	driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div/div/div/div[2]/div[2]/div/div/div[1]/div/form/a/button").click()
	time.sleep(5)

	driver.find_element(By.XPATH, "//*[@id=\"ctl00_ContentMiddle_EventListImages1_GridView1_ctl03_SELECTEVENT\"]").click()

	time.sleep(5)

options = uc.options.ChromeOptions()
options.add_argument('--headless=new')
options.binary_location = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'

driver = uc.Chrome(options=options)
driver.get("https://tickets.fcbayern.com/Internetverkaufzweitmarkt/EventList.aspx")
time.sleep(5)

logIn()

numOfTicketRows = 0

while True:
	try:
		numOfTicketRows = driver.find_elements(By.XPATH, "/html/body/form/div[3]/div/div[2]/div/div/div/div[1]/div[4]/div/table/tbody/tr")
	except:
		displayNotification("FCB vs BVB", "Error when parsing ticket table.", "Morse")

	if(len(numOfTicketRows) > 1):
		displayNotification("FCB vs BVB", "Tickets available!", "Hero")

	time.sleep(30)
	driver.refresh()
	time.sleep(5)
	if(driver.current_url == 'https://tickets.fcbayern.com/internetverkaufzweitmarkt/SessionTimeout.aspx'):
		driver.find_element(By.XPATH, "//*[@id=\"ctl00_ContentMiddle_SessionTimeoutInfo1_ToEventList\"]").click()
		logIn()
driver.close()
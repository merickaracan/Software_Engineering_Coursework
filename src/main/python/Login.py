#will add database support when database is set up
def readDatabase():
    #will find the username, email and password from the database

def login():
    find_username = str(input("Enter Username or Email: "))
    find_password = str(input("Enter Password: "))
    logged_in = False
    #Code not ready due to lack of database, but will be similar to below, small changes to be made
    #for line in database_reading:
        #if line[0] or line[1] == find_username and logged_in == False:
            #if line[2] == find_password:
                #logged_in = True

    if logged_in == True:
        print("Logged in succsefully")
        #add code to find user ID when database set up
    else:
        print("Incorrect Login details, please try again")
        login()



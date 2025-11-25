import user

def Sign_up():
    Username = str(input("Please enter the name you would like displayed: "))
    Email = str(input("Please enter your Bath email address: "))
    Password = str(input("Please enter a password of 8 or more characters: "))
    Lecturer = str(input("Please enter 'Lecturer' if this is a lecturer account: "))

    if len(Username) >= 3:
        if email.contains("@bath"):
            if len(password) >= 8:
                if Lecturer == "Lecturer":
                    #will need to use something other than account, this is temporary
                    account = user(Username, Email, Password, True, id) #add code to find ID
                else:
                    account = user(Username, Email, Password, False, id)
            else:
                print("Password must be 8 or more characters")
                Sign_up()
        else:
            print("Email must be a valid Bath email")
            Sign_up()
    else:
        print("Username must be at least 3 characters")
        Sign_up()


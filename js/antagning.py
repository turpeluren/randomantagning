#Get all courses from antagning.se

anthtml = str(input("AntagningHTML: "))

anthtml = anthtml.split('"headline4">')
sortedhtml = [None]*32
print()



#printa allt fint
for i in anthtml:
    i = i.split("<")[0]
    print(i)

print("\nEnd of program")

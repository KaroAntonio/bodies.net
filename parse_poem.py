import json

poem_titles = ['lost_body','the_human_body']
poems = {}
for title in poem_titles:
    f = open('assets/'+title+'.txt')
    lines = []
    
    for line in f:
        lines.append(line)
    poems[title] = lines
    f.close()
    
with open('assets/poems.json', 'w') as outfile:
    json.dump(poems, outfile)
    
import json
cat=json.load(open('../_shared/catalog.json'))
DROP={'proxyConfiguration','apolloApiKey','socrataAppToken','webhookUrl','stateStoreName','onlyNewSinceLastRun','reportRemoved','monitorMode','deltaMode'}
tools=[]
def clean(p):
    o={k:v for k,v in p.items() if k in ('type','title','description','default','enum','items','minimum','maximum','example','format')}
    if 'items' in o and isinstance(o['items'],dict): o['items']={k:v for k,v in o['items'].items() if k in ('type','enum','properties','required')}
    return o
for a in cat:
    inp=a['input'] or {}
    props={k:clean(v) for k,v in inp.get('properties',{}).items() if k not in DROP and v.get('type')!='object' or (k not in DROP and k=='startUrls')}
    props['max_results']={'type':'integer','description':'Max rows returned to the agent (default 25, hard cap 200). Billing is per result produced by the actor.','default':25,'minimum':1,'maximum':200}
    desc=(a['description'] or a['title']).strip()
    tools.append(dict(slug=a['slug'],name=a['slug'].replace('-','_'),title=a['title'],description=f"{desc} (Apify actor transparent_meteorite/{a['slug']}; pay-per-result.)",inputSchema=dict(type='object',properties=props,required=[r for r in inp.get('required',[]) if r in props])))
json.dump(tools,open('src/tools.json','w'),indent=1)
print(len(tools),[t['name'] for t in tools if 'startUrls' in t['inputSchema']['properties']])

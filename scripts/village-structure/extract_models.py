import ast,io,json,sys
src=io.open(sys.argv[1],encoding="utf-8").read()
t=ast.parse(src); out=[]
for n in t.body:
    if not isinstance(n,ast.ClassDef): continue
    tn=None; cols=[]; doc=ast.get_docstring(n) or ""
    for b in n.body:
        tg=None;val=None
        if isinstance(b,ast.Assign): tg=b.targets[0];val=b.value
        elif isinstance(b,ast.AnnAssign): tg=b.target;val=b.value
        if tg is None or not isinstance(tg,ast.Name): continue
        if tg.id=="__tablename__": tn=val.value; continue
        if tg.id=="__table_args__":
            cols.append(["__args__",ast.unparse(val)[:160],[]]); continue
        if val is None: continue
        s=ast.unparse(val)
        if "Column(" in s or "mapped_column(" in s:
            flags=[]
            if "primary_key=True" in s: flags.append("PK")
            if "ForeignKey(" in s: flags.append("FK:"+s.split("ForeignKey(")[1].split(")")[0].strip("'\""))
            if "unique=True" in s: flags.append("UQ")
            if "index=True" in s: flags.append("IX")
            if "nullable=False" in s: flags.append("NN")
            ty=s.split("(",1)[1].split(",")[0].split("(")[0].strip(")")
            cols.append([tg.id,ty,flags])
    if tn: out.append({"cls":n.name,"table":tn,"line":n.lineno,"doc":doc.split("\n")[0][:140],"cols":cols})
json.dump(out,io.open(sys.argv[2],"w",encoding="utf-8"),ensure_ascii=False,indent=0)
print(len(out), "tables")

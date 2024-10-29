class ApiFeatures{
    constructor(query,qstring)
    { 
        this.query=query
        this.qstring=qstring
    }

    filtring()
    {
      let str={...this.qstring}
      let arr=['page','limit','sort','fields']
      arr.forEach(el=>{
        delete str[el];
      })
      str=JSON.stringify(str)
      str=str.replace(/\b(gte|gt|lt|lte)\b/g,match=>`$${match}`)
      this.query=this.query.find(JSON.parse(str))

      return this
    }

    sorting()
    { 
      let str=this.qstring.sort
      
      if(str==undefined) return this

      str=str.split(',').join(' ')
      this.query=this.query.sort(str)
      return this
    }

    fields()
    { 
      let str=this.qstring.fields
      str=str || '-__v'
      str=str.split(',').join(' ')
      this.query=this.query.select(str)
      return this
    }

    pagination()
    {
      let pg=this.qstring.page || 1;
      let lim=this.qstring.limit || 3;
      this.query=this.query.skip((pg-1)*3).limit(lim)
    }
}

module.exports=ApiFeatures
const data = {
    request: {
        message: "アルファ案とベータ案で非常に僅差ですが、ベータ案の方がスコア的に高くなりました。承認よろしくお願いいたします。",
        flow: [{
                name: "Aさん",
                department: "",
                position: "所属長",
                state: "処理済"
            },
            {
                name: "Bさん",
                department: "",
                position: "部門長",
                state: "処理済"
            },
            {
                name: "Cさん",
                department: "",
                position: "IT部門長",
                state: "未処理"
            },
            {
                name: "Xさん",
                department: "",
                position: "経営企画部 部門長",
                state: "未処理"
            },
        ],
    },
    confirmation: {
        flow:[
            {state:"承認", name:"Aさん", position:"所属長", comment:"OKです", date:"2020/12/21 9:00"},
            {state:"承認", name:"Bさん", position:"部門長", comment:"気になる箇所はありますが、ＯＫです", date:"2020/12/21 10:00"},
            {state:"却下", name:"Cさん", position:"部門長", comment:"より重要な施策に集中するためにリソースを使うので、この件は却下します。", date:"2020/12/21 11:00"},
            {state:"未処理", name:"Xさん", position:"経営企画部 部門長", comment:"", date:""},
        ]
    }
}
export default data;
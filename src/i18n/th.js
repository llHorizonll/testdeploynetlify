const thCustomMessages = {
  ra: {
    action: {
      delete: "ลบ",
      show: "แสดง",
      list: "รายการ",
      save: "บันทึก",
      create: "สร้าง",
      edit: "แก้ไข",
      cancel: "ยกเลิก",
      refresh: "รีเฟรช",
      add_filter: "เพิ่มตัวกรอง",
      remove_filter: "ลบตัวกรอง",
    },
    boolean: {
      true: "ใช่",
      false: "ไม่ใช่",
    },
    page: {
      loading: "กำลังโหลดข้อมูล",
      list: "รายการ %{name}",
      edit: "แก้ไข %{name} #%{id}",
      show: "แสดง %{name} #%{id}",
      create: "สร้าง %{name}",
      delete: "ลบ %{name} #%{id}",
      dashboard: "แดชบอร์ด",
    },
    input: {
      image: {
        upload_several: "อัปโหลดหลายไฟล์",
        upload_single: "อัปโหลด",
      },
    },
    message: {
      loading: "กรุณา รอสักครู่",
      yes: "ใช่",
      no: "ไม่ใช่",
      are_you_sure: "คุณแน่ใจหรือไม่?",
      about: "เกี่ยวกับ",
    },
    navigation: {
      page_out_of_boundaries: "เกินจำนวนหน้าทั้งหมด",
      page_out_from_end: "เกินจำนวนหน้าสุดท้าย",
      page_out_from_begin: "เกินจำนวนหน้าแรก",
      page_range_info: "%{offsetBegin}-%{offsetEnd} จาก %{total}",
      next: "ถัดไป",
      prev: "ย้อนกลับ",
    },
    auth: {
      username: "ชื่อผู้ใช้งาน",
      password: "รหัสผ่าน",
      sign_in: "เข้าระบบ",
      sign_in_error: "การเข้าระบบล้มเหลว",
      logout: "ออกจากระบบ",
    },
    notification: {
      updated: "แก้ไขข้อมูลแล้ว",
      created: "เพิ่มข้อมูลแล้ว",
      deleted: "ลบข้อมูลแล้ว",
      item_doesnt_exist: "ไม่มีรายการ",
      http_error: "การเชื่อมต่อล้มเหลว",
    },
    validation: {
      required: "จำเป็น",
      minLength: "ต้องมีอักขระอย่างน้อย %{max} ตัว",
      maxLength: "ต้องมีอักขระไม่เกิน %{max} ตัว",
      minValue: "ต้องมีอย่างน้อย %{max} ตัว",
      maxValue: "ต้องมีไม่เกิน %{max} ตัว",
      number: "ต้องเป็นตัวเลขเท่านั้น",
    },
    module: {
      "General Ledger": "บัญชีแยกประเภททั่วไป",
      "Journal Voucher": "ใบสำคัญรายวันทั่วไป",
      "Standard Journal Voucher": "แม่แบบใบสำคัญรายวันทั่วไป",
      "Standard Jv": "แม่แบบใบสำคัญรายวันทั่วไป",
      "Chart Of Account": "ผังบัญชี",
      Budget: "งบประมาณ",
      "Accounts Payable": "บัญชีค้างจ่าย",
      Vendor: "ผู้ขาย",
      Invoice: "ใบแจ้งหนี้",
      Payment: "ชำระใบแจ้งหนี้",
      "Accounts Receivable": "บัญชีค้างรับ",
      Profile: "ข้อมูลบัญชีลูกหนี้",
      "A/R Profile": "ข้อมูลบัญชีลูกหนี้",
      "A/R Contract": "สัญญาลูกหนี้",
      Folio: "โฟลิโอ",
      Receipt: "ใบเสรจรับเงิน",
      Asset: "การจัดการสินทรัพย์",
      "Asset Management": "การจัดการสินทรัพย์",
      "Asset Register": "ทะเบียนสินทรัพย์",
      "Asset Disposal": "ตัดจำหน่ายสินทรัพย์",
      Procedure: "กระบวนการ",
      Report: "รายงาน",
      Setting: "การตั้งค่า",
      Configuration: "การกำหนดค่า",
    },
    actionMenu: {
      Add: "สร้าง",
      Edit: "แก้ไข",
      Delete: "ลบ",
      Void: "ลบ",
      Copy: "สำเนา",
      Template: "ฉบับร่าง",
      Print: "รายงาน",
    },
    info: {
      notransaction: "There is no any transaction",
    },
    question: {
      confirmDel: "ยืนยันการลบรายการ ?",
      confirmVoid: "ยืนยันการยกเลิกรายการ ?",
      confirmPrintCheque: "Confirm print cheque?",
    },
    field: {
      Username: "ชื่อผู้ใช้",
      Date: "วันที่",
      Prefix: "คำนำหน้า",
      "Journal Voucher": "ใบสำคัญรายวันทั่วไป",
      "Standard Journal Voucher": "แม่แบบใบสำคัญรายวันทั่วไป",
      "Journal Voucher No.": "เลขใบสำคัญรายวันทั่วไป",
      Description: "คำอธิบาย",
      "Voucher No.": "เลขใบสำคัญทั่วไป",
      Source: "แหล่งที่มา",
      Status: "สถานะ",
      Active: "เปิดใช้งาน",
      "In-Active": "ปิดใช้งาน",
      Account: "รหัส",
      "Account #": "รหัส #",
      Department: "แผนก",
      "Dept.": "แผนก",
      "Acc.": "โค้ด",
      "Account Code": "โค้ด",
      "Account Name": "ชื่อบัญชี",
      Currency: "สกุลเงิน",
      Rate: "อัตราแลกเปลี่ยน",
      "Rate (%)": "อัตราแลกเปลี่ยน (%)",
      Debit: "เดบิต",
      Credit: "เครดิต",
      Address: "ที่อยู่",
      Amount: "จำนวนเงิน",
      "Dr Amount": "จำนวนเงิน เดบิต",
      "Cr Amount": "จำนวนเงิน เครดิต",
      Base: "จำนวน",
      "Dr Base": "จำนวน เดบิต",
      "Cr Base": "จำนวน เครดิต",
      "Total Amount": "จำนวนทั้งหมด",
      "Cheq. Date": "วันที่ออกเช็ค",
      "Cheq. No. From": "หมายเลขเช็คจาก",
      "Cheq. No. To": "หมายเลขเช็คถึง",
      "Clearing Date": "วันที่หักบัญชี",
      Comment: "หมายเหตุ",
      "A/R Profile": "ข้อมูลบัญชีลูกหนี้",
      "A/R No.": "A/R No.",
      "AR No.": "AR No.",
      Title: "Title",
      Type: "Type",
      "First Name": "ชื่อ",
      "Last Name": "นามสกุล",
      "Register Date": "วันที่ลงทะเบียน",
      Name: "ชือ",
      "Company Name": "บริษัท",
      Position: "ตำแหน่ง",
      Tel: "เบอร์โทร",
      "Tax ID.": "เลขประจำตัวของผู้เสียภาษี",
      Email: "อีเมล์",
      Remark: "ข้อคิดเห็น",
      Address1: "ที่อยู่ 1",
      Address2: "ที่อยู่ 2",
      Address3: "ที่อยู่ 3",
      Payment: "ชำระใบแจ้งหนี้",
      "Credit Limit": "วงเงิน",
      Term: "ระยะเครดิต",
      "Billing To": "เรียกเก็บเงินไปยัง",
      "Mailing To": "ส่งจดหมายไปยัง",
      "Tax Invoice Address": "ที่อยู่ใบกำกับภาษี",
      "A/R Contract": "สัญญาลูกหนี้",
      "Contract No.": "เลขสัญญาลูกหนี้",
      "Start Contract": "วันที่เริ่มสัญญา",
      "End Contract": "วันสิ้นสุดที่เริ่มสัญญา",
      Owner: "เจ้าของ",
      Project: "โครงการ",
      "Charge Every Month": "ชาร์จทุกกี่เดือน",
      Year: "ปี",
      "Vendor No": "Vendor No",
      "Vendor Category": "Vendor Category",
      "WHT. Name": "WHT. Name",
      "Chq. Name": "Chq. Name",
      Attn: "Attn",
      Fax: "Fax",
      Reference: "Reference",
      "Mapping Ref.": "Mapping Ref.",
      "Branch No": "Branch No",
      "Bus Reg No.": "Bus Reg No.",
      "Discount Term": "Discount Term",
      "Less (%)": "Less (%)",
      "Vat Type 1": "Vat Type 1",
      "Vat Rate 1 (%)": "Vat Rate 1 (%)",
      "Dr Vat 1": "Dr Vat 1",
      "Cr A/P Acc.": "Cr A/P Acc.",
      "Payment Dept.": "Payment Dept.",
      "WHT. Dept.": "WHT. Dept.",
      "WHT. Acc.": "WHT. Acc.",
      "Bank Name": "Bank Name",
      "Acc Name": "Acc Name",
      "Acc No": "Acc No",
      "Bank Ref 1": "Bank Ref 1",
      "Bank Ref 2": "Bank Ref 2",
      "Bank Ref 3": "Bank Ref 3",
      "Invoice No.": "Invoice No.",
      Vendor: "Vendor",
      Information: "Information",
      "Invoice Default": "Invoice Default",
      "Payment Default": "Payment Default",
      "AutoPay Information": "AutoPay Information",
      "Input Date": "Input Date",
      "Invoice Date": "Invoice Date",
      "Due Date": "Due Date",
      "Tax Inv No.": "Tax Inv No.",
      "Tax Status": "Tax Status",
      "Tax Invoice Date": "Tax Invoice Date",
      Period: "Period",
      "Payment Date": "Payment Date",
      "Payment Type": "Payment Type",
      Payee: "Payee",
      "WHT. Form": "WHT. Form",
      "WHT. No": "WHT. No",
      Ref: "Ref",
      "Dept. Code": "Dept. Code",
      "Acc. Code": "Acc. Code",
      "Dr Dept. Code": "Dept. Code",
      "Dr Acc. Code": "Dr Acc. Code",
      "Cr Dept. Code": "Dept. Code",
      "Cr Acc. Code": "Cr Acc. Code",
      "Receipt Ref. No.": "Receipt Ref. No.",
      "Receipt Date": "Receipt Date",
      "Pay Ref No.": "Pay Ref No.",
      "Pay Date": "Pay Date",
      "Pay Type": "Pay Type",
      "Asset No.": "Asset No.",
      "Acquire Date": "Acquire Date",
      BarCode: "BarCode",
      Category: "Category",
      Location: "Location",
      "Serial No.": "Serial No.",
      "Transfer Date": "Transfer Date",
      Specification: "Specification",
      "Asset Life": "Asset Life",
      "Init Accu Depre": "Init Accu Depre",
      "Salvage / Unit": "Salvage / Unit",
      "Total Salvage": "Total Salvage",
      "Amount/Unit": "Amount/Unit",
      Unit: "Unit",
      Qty: "Qty",
      "Base Amt.": "Base Amt.",
      "Net Book Value": "Net Book Value",
      "Total Value": "Total Value",
      "Life (Days)": "Life (Days)",
      "Cost Dept.": "Cost Dept.",
      "Cost Acc.": "Cost Acc.",
      "Accu Dept.": "Accu Dept.",
      "Accu Acc.": "Accu Acc.",
      "Depre Dept.": "Depre Dept.",
      "Depre Acc.": "Depre Acc.",
      "Accu Depre.": "Accu Depre.",
      LastCost: "LastCost",
      "Disposal Type": "Disposal Type",
      "Sale Amount": "Sale Amount",
      "Disposal Date": "Disposal Date",
      "Gain/Loss Amount": "Gain/Loss Amount",
      "Total Asset Value": "Total Asset Value",
      "Asset Department": "Asset Department",
      "Asset Account": "Asset Account",
      "Accu Department": "Accu Department",
      "Accu Account": "Accu Account",
      "Gain/Loss Department": "Gain/Loss Department",
      "Gain/Loss Account": "Gain/Loss Account",
      "Sale Department": "Sale Department",
      "Sale Account": "Sale Account",
    },
    fieldAbbr: {
      date: "วันที่",
      prefix: "คำนำหน้า",
      jv: "ใบสำคัญรายวันทั่วไป",
      jvNo: "เลขใบสำคัญรายวันทั่วไป",
      desc: "คำอธิบาย",
      vouNo: "เลขใบสำคัญทั่วไป",
      source: "แหล่งที่มา",
      status: "สถานะ",
      active: "เปิดใช้งาน",
      inactive: "ปิดใช้งาน",
      account: "รหัส",
      account1: "รหัส #",
      dept: "แผนก",
      accountCode: "โค้ด",
      accountName: "ชื่อบัญชี",
      currency: "สกุลเงิน",
      rate: "อัตราแลกเปลี่ยน",
      ratePercent: "อัตราแลกเปลี่ยน (%)",
      dr: "เดบิต",
      cr: "เครดิต",
      address: "ที่อยู่",
      amount: "จำนวนเงิน",
      base: "จำนวน",
      totalAmount: "จำนวนทั้งหมด",
      cheqDate: "วันที่ออกเช็ค",
      cheqNoFrom: "หมายเลขเช็คจาก",
      cheqNoTo: "หมายเลขเช็คถึง",
      clearingDate: "วันที่หักบัญชี",
      comment: "หมายเหตุ",
    },
    apInvoice: {
      title: "ใบแจ้งหนี้",
      delInvoiceSettled: "ไม่สามารถลบรายการนี้ได้ เนื่องจากใบแจ้งหนี้ได้ถูกชำระแล้ว",
      settleWarnning:
        "ใบแจ้งหนี้ได้ถูกชำระแล้ว หรือโอนเข้าจากระบบอื่น หรือ อยู่ในรอบบัญชีที่ปิดแล้ว ระบบอนุญาติให้แก้ไขได้เฉพาะข้อมูลใบกำกับภาษี กรุณายืนยันหากท่านต้องการทำการแก้ไข",
      invoiceAmountWarnning1: "จำนวนเงินในใบแจ้งหนี้น้อยกว่ายอดที่ต้องการชำระ ไม่สามารถทำรายการต่อ",
      invoiceAmountWarnning2: "จำนวนเงินชำระมากกว่ายอดใบแจ้งหนี้",
    },
    apPayment: {
      title: "การชำระเงิน",
      closePeriodWarnning:
        "รายการที่ต้องการแก้ไขอยู่ในรอบบัญชีที่ปิดแล้ว ท่านสามารถแก้ไขได้เฉพาะข้อมูลเช็คจ่าย กรุณายืนยันหากท่านต้องการทำการแก้ไข",
    },
    asset: {
      disposed: "สินทรัยพ์รายการนี้ได้ถูกตัดจำหน่ายออกแล้ว",
    },
    closePeriod: {
      warning: "ไม่สามารถแก้ไข ลบ หรือยกเลิกรายการนี้ได้ เนื่องจากวันที่บันทึกรายการอยู่ในรอบบัญชีที่ปิดแล้ว",
      dateWarning: "วันที่ชำระ, วันที่หักบัญชี หรือ วันที่เช็คอยู่ในรอบบัญชีที่ปิดแล้ว กรุณาใส่ให้ถูกต้อง",
    },
    permission: {
      denied: "ไม่ได้รับให้เข้าใช้งาน",
      selectVendorFirst: "กรุณาเลือกผู้ขายก่อน",
      selectProfileFirst: "กรุณาเลือกข้อมูลบัญชีลูกหนี้ก่อน",
    },
  },
};

export default thCustomMessages;
import { DEFAULT_PATHS } from 'config.js';
import { USER_ROLE } from 'constants.js';
import { lazy, React } from 'react';
import Advertisement from 'views/seller/Advertisement/Advertisement';
import MyAds from 'views/seller/Advertisement/MyAds';

/* ------------------------------------------------------------------ */
/* -------------------------  Master Panel   ------------------------ */
/* ------------------------------------------------------------------ */

const masterAdmin = {
  dashboard: lazy(() => import('views/masterAdmin/dashboard/Dashboard')),
  createAdminList: lazy(() => import('views/masterAdmin/createAdmin/CreateAdmin')),
};

/* ------------------------------------------------------------------ */
/* -----------------------  Portal Admin Panel  --------------------- */
/* ------------------------------------------------------------------ */

const dashboard = lazy(() => import('views/admin/dashboard/Dashboard'));
const category = {
  list: lazy(() => import('views/admin/Category/List/ListViewCategory')),
};
const account = {
  add: lazy(() => import('views/admin/Account Detail/Add/AddNewAccount')),
  detail: lazy(() => import('views/admin/Account Detail/Detail/DetailAccount')),
  setting: lazy(() => import('views/admin/Account Detail/Setting/Basic')),
  pincode: lazy(() => import('views/admin/Account Detail/Pincode/Pincode')),
};
const ad = {
  list: lazy(() => import('views/admin/Advertisement/List/ListAd')),
  add: lazy(() => import('views/admin/Advertisement/Add/AddNewAd')),
  cat: lazy(() => import('views/admin/Advertisement/Cat/ListCat')),
  pro: lazy(() => import('views/admin/Advertisement/Pro/ProductAd')),
  adsCategory: lazy(() => import('views/admin/Advertisement/Cat/AdCategoryManager')),
  adTier: lazy(() => import('views/admin/Advertisement/CategoryMaster/AdTierMasterManager')),
  approval: lazy(() => import('views/admin/Advertisement/Approval/AdApproval')),
};
const b2b = {
  list: lazy(() => import('views/admin/B2B/List/ListB2B')),
  detail: lazy(() => import('views/admin/B2B/Detail/DetailB2B')),
};
const blog = {
  list: lazy(() => import('views/admin/Blog/List/ListBlog')),
  add: lazy(() => import('views/admin/Blog/Add/AddBlog')),
  detail: lazy(() => import('views/admin/Blog/Detail/DetailBlog')),
};
const email = {
  list: lazy(() => import('views/admin/Email Template/List/ListEmail')),
  add: lazy(() => import('views/admin/Email Template/Add/AddNewEmail')),
  detail: lazy(() => import('views/admin/Email Template/Detail/DetailEmail')),
};
const activity = {
  carts: lazy(() => import('views/admin/Activity/Carts')),
  wishlists: lazy(() => import('views/admin/Activity/Wishlists')),
  contactEnquiries: lazy(() => import('views/admin/Activity/ContactEnquiries')),
  productEnquiries: lazy(() => import('views/admin/Activity/ProductEnquiries')),
  bulkProductEnquiries: lazy(() => import('views/admin/Activity/BulkProductEnquiries')),
  cartEnquiries: lazy(() => import('views/admin/Activity/CartEnquiries')),
  subscriptions: lazy(() => import('views/admin/Activity/Subscriptions')),
  detail: lazy(() => import('views/admin/Activity/Detail/DetailEnquire')),
};
const order = {
  orderlist: lazy(() => import('views/admin/Order/List/ListOrder')),
  issuelist: lazy(() => import('views/admin/Order/List/IssueOrder')),
  detail: lazy(() => import('views/admin/Order/Detail/OrdersDetail')),
  issuedetail: lazy(() => import('views/admin/Order/Detail/IssueDetail')),
};
const seller = {
  list: lazy(() => import('views/admin/Seller/List/ListSeller')),
  add: lazy(() => import('views/admin/Seller/Add/AddSeller')),
  detail: lazy(() => import('views/admin/Seller/Detail/DetailSeller')),
  reviewdetail: lazy(() => import('views/admin/Seller/Detail/SellerReviewDetail')),
  commission: lazy(() => import('views/admin/Seller/Commission/Commission')),
  productList: lazy(() => import('views/admin/Seller/Seller Products/SellerProductList')),
  seriesList: lazy(() => import('views/admin/Seller/Seller Products/SellerSeriesList')),
  orderdetail: lazy(() => import('views/admin/Seller/Order Detail/OrdersDetail')),
  orderlist: lazy(() => import('views/admin/Seller/Order List/OrdersList')),
};
const associate = {
  seller: lazy(() => import('views/admin/Associate/Seller')),
  enquiry: lazy(() => import('views/admin/Associate/Enquiry')),
  service: lazy(() => import('views/admin/Associate/Service')),
  business: lazy(() => import('views/admin/Associate/Business')),
  businessDetail: lazy(() => import('views/admin/Associate/BADetail')),
};
const series = {
  list: lazy(() => import('views/admin/Series/List/ListSeries')),
  add: lazy(() => import('views/admin/Series/Add/AddSeries')),
  detail: lazy(() => import('views/admin/Series/Detail/DetailViewProduct')),
};
const shipping = {
  list: lazy(() => import('views/admin/Shipping/List/ListShipping')),
  add: lazy(() => import('views/admin/Shipping/Add/AddShipping')),
};
const siteContent = {
  list: lazy(() => import('views/admin/Site Content/List/ListSiteContent')),
  add: lazy(() => import('views/admin/Site Content/Add/AddSiteContent')),
  detail: lazy(() => import('views/admin/Site Content/Detail/DetailSiteContent')),
  navbarLogo: lazy(() => import('views/admin/Site Content/Navlogo/HandleNavLogo')),
  meetOurTeam: lazy(() => import('views/admin/Site Content/Meet Our Team/MeetTeam')),
  emailconfig: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfig')),
  adminenquiryemail: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfigTemplate/AdminEnquiryEmail')),
  accountsenquiryemail: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfigTemplate/AccountsEnquiryEmail')),
  contactpageemail: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfigTemplate/ContactPageEmail')),
  sellernquiryemail: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfigTemplate/SellerEnquiryEmail')),
  shoppingcartenquiryemail: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfigTemplate/ShoppingCartEnquiryEmail')),
  bulkenquiryemail: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfigTemplate/BulkEnquiryEmail')),
  sellerb2benquiryemail: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfigTemplate/SellerB2bEnquiryEmail')),
  orderreceivedenquiryemail: lazy(() => import('views/admin/Site Content/EmailConfig/EmailConfigTemplate/OrderReceivedEnquiryEmail')),
  email: lazy(() => import('views/admin/Site Content/Email/Email')),
  sms: lazy(() => import('views/admin/Site Content/Sms/Sms')),
  whatsappapi: lazy(() => import('views/admin/Site Content/Whatsappapi/Whatsappapi')),
  seopage: lazy(() => import('views/admin/Site Content/SeoPage/Seo_Page')),
  userAdd: lazy(() => import('views/admin/Site Content/UserAdd/User_Add')),
  associateAdd: lazy(() => import('views/admin/Site Content/AssociateAdd/Associate_Add')),
  associatePDF: lazy(() => import('views/admin/Site Content/AssociateAdd/Associate_PDF')),
  bulkEnquiry: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BulkEnquiry')),
  buyRequest: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequest')),
  buyRequestsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequestsubject')),
  buyRequestFailure: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequestFailure')),
  buyRequestFailuresubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequestFailuresubject')),
  buyRequestProof: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequestProof')),
  buyRequestProofsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequestProofsubject')),
  buyRequestReceipt: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequestReceipt')),
  buyRequestReceiptsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequestReceiptsubject')),
  contactEnquiryPage: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ContactEnquiryPage')),
  contactEnquiryPagesubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ContactEnquiryPagesubject')),
  customerRegistration: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/CustomerRegistration')),
  customerRegistrationsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/CustomerRegistrationsubject')),
  forgotPassword: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ForgotPassword')),
  forgotPasswordsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ForgotPasswordsubject')),
  onlineOrderSuccess: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OnlineOrderSuccess')),
  onlineOrderSuccesssubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OnlineOrderSuccesssubject')),
  orderCancel: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderCancel')),
  orderCancelsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderCancelsubject')),
  orderDelivery: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderDelivery')),
  orderDeliverysubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderDeliverysubject')),
  orderDispatched: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderDispatched')),
  orderDispatchedsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderDispatchedsubject')),
  orderPacked: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderPacked')),
  orderPackedsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderPackedsubject')),
  shoppingCartEnquiryPage: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ShoppingCartEnquiryPage')),
  shoppingCartSubjectEnquiryPage: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ShoppingCartSubjectEnquiryPage')),
  subscriptionLetter: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/SubscriptionLetter')),
  updatePassword: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/UpdatePassword')),
  updatePasswordsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/UpdatePasswordsubject')),

  enquiryRegistrationSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/EnquiryRegistrationSubject')),
  enquiryRegistration: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/EnquiryRegistration')),
  enquiryRequestApproveSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/EnquiryRequestApproveSubject')),
  enquiryRequestApprove: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/EnquiryRequestApprove')),

  serviceRegistrationSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ServiceRegistrationSubject')),
  serviceRegistration: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ServiceRegistration')),
  serviceRequestApproveSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ServiceRequestApproveSubject')),
  serviceRequestApprove: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ServiceRequestApprove')),

  sellerRegistrationSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/SellerRegistrationSubject')),
  sellerRegistration: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/SellerRegistration')),
  sellerRequestApproveSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/SellerRequestApproveSubject')),
  sellerRequestApprove: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/SellerRequestApprove')),

  businessRegistrationSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BusinessRegistrationSubject')),
  businessRegistration: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BusinessRegistration')),
  businessRequestApproveSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BusinessRequestApproveSubject')),
  businessRequestApprove: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BusinessRequestApprove')),

  dealerAlreadyRegistrationSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/DealerAlreadyRegistrationSubject')),
  dealerAlreadyRegistration: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/DealerAlreadyRegistration')),
  dealerAlreadyRequestApproveSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/DealerAlreadyRequestApproveSubject')),
  dealerAlreadyRequestApprove: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/DealerAlreadyRequestApprove')),

  dealerNewRegistrationSubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/DealerNewRegistrationSubject')),
  dealerNewRegistration: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/DealerNewRegistration')),

  sellerRequestReject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/SellerRequestReject')),
  b2bRagistration: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/B2bRegistration')),
  b2bRequestApprove: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/B2bRequestApprove')),
  b2bRequestReject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/B2bRequestReject')),
  singleEnquiryCustomer: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/SingleEnquiryCustomer')),
  singleEnquirySubjectCustomer: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/SingleEnquirySubjectCustomer')),
  bulkEnquiryCustomer: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BulkEnquiryCustomer')),
  bulkEnquirySubjectCustomer: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BulkEnquirySubjectCustomer')),
  onlineTryEmail: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OnlineTryEmail')),
  onlineTryEmailsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OnlineTryEmailsubject')),
  orderSuccessSeller: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderSuccessSeller')),
  orderSuccessSellersubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderSuccessSellersubject')),
  buyRequestOrderPlaced: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/BuyRequestOrderPlaced')),
  orderCancelSeller: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderCancelSeller')),
  orderCancelSellersubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/OrderCancelSellersubject')),
  dmtpaymentAdmin: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/DmtPaymentAdmin')),
  dmtpaymentAdminsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/DmtPaymentAdminsubject')),
  productapprove: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ProductApproval')),
  productapprovesubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ProductApprovalsubject')),
  productreject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ProductReject')),
  productrejectsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ProductRejectsubject')),
  productclass: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ProductClass')),
  productclasssubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/ProductClasssubject')),
  onlinepaymentfailed: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/Onlinepaymentfailed')),
  onlinepaymentfailedsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/Onlinepaymentfailedsubject')),
  review: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/review')),
  reviewsubject: lazy(() => import('views/admin/Site Content/Email/EmailTemplate/reviewsubject')),

  customerRegistrationsms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/CustomerRegistrationsms')),
  orderCancelCustomersms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OrderCancelCustomersms')),
  orderCancelSellersms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OrderCancelsellersms')),

  orderdeliverysms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OrderDeliveryCustomer')),
  ordercheckoutsms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/CheckOutPagesms')),
  ordershipsms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OrderShipsms')),
  orderpacksms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OrderPacksms')),
  ordersuccesssms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OrderSuccesssms')),
  ordersuccesssellersms: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OrderSuccessSellersms')),
  onlineorderreceiveds: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OnlineOrderReceivedS')),
  dmtorderreceiveds: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/OrderSuccesssms')),
  dmtorderreceivedc: lazy(() => import('views/admin/Site Content/Sms/SmsTemplate/DmtOrderReceivedC')),

  customerRegistrationWhatsappapi: lazy(() => import('views/admin/Site Content/Whatsappapi/WhatsappapiTemplate/CustomerRegistrationWhatsappapi')),
  ordersuccessWhatsappapi: lazy(() => import('views/admin/Site Content/Whatsappapi/WhatsappapiTemplate/OrderSuccessWhatsappapi')),
  ordersuccesssellerWhatsappapi: lazy(() => import('views/admin/Site Content/Whatsappapi/WhatsappapiTemplate/OrderSuccessSellerWhatsappapi')),
  orderpackWhatsappapi: lazy(() => import('views/admin/Site Content/Whatsappapi/WhatsappapiTemplate/OrderPackWhatsappapi')),
  ordershipWhatsappapi: lazy(() => import('views/admin/Site Content/Whatsappapi/WhatsappapiTemplate/OrderShipWhatsappapi')),
  orderdeliveryWhatsappapi: lazy(() => import('views/admin/Site Content/Whatsappapi/WhatsappapiTemplate/OrderDeliveryWhatsappapi')),
};
const user = {
  list: lazy(() => import('views/admin/Users/List/ListViewUser')),
  detail: lazy(() => import('views/admin/Users/Detail/DetailViewUser')),
  orderdetail: lazy(() => import('views/admin/Users/Order Detail/OrdersDetail')),
  orderlist: lazy(() => import('views/admin/Users/Order List/OrdersList')),
};
const product = {
  list: lazy(() => import('views/admin/Product/List/ListViewProduct')),
  add: lazy(() => import('views/admin/Product/Add/AddNewProduct')),
  detail: lazy(() => import('views/admin/Product/Detail/DetailViewProduct')),
  multipleseller: lazy(() => import('views/admin/Product/MultipleSeller/MultipleSeller')),
  multiplesellerlist: lazy(() => import('views/admin/Product/MultipleSeller/MultipleSellerList')),
  variantname: lazy(() => import('views/admin/Product/MultipleSeller/VariantName')),
  seriesDetail: lazy(() => import('views/admin/Product/Details/DetailViewProducts')),
  seriesproductdetail: lazy(() => import('views/admin/Product/ProductDetail/List')),
  review: lazy(() => import('views/admin/Product/List/Review')),
};
const productApproval = {
  detail: lazy(() => import('views/admin/Product Approval/Detail/DetailViewProduct')),
  productApprovalList: lazy(() => import('views/admin/Product Approval/List/ProductApprovalList')),
  detailSuperProduct: lazy(() => import('views/admin/Product Approval/DetailSuperProduct/DetailViewProduct')),
  productApprovalListSuperProduct: lazy(() => import('views/admin/Product Approval/ListSuperProduct/ProductApprovalList')),
};
const tmtProduct = {
  list: lazy(() => import('views/admin/tmt products/List/ListViewProduct')),
  detail: lazy(() => import('views/admin/tmt products/Detail/DetailViewMaster')),
  tmtList: lazy(() => import('views/admin/tmt products/Tmt product list/ListViewProduct')),
  add: lazy(() => import('views/admin/tmt products/Add/AddNewProduct')),
  addTmtVariant: lazy(() => import('views/admin/tmt products/Tmt variant add/TmtVariantAdd')),
};
const productattributes = {
  add: lazy(() => import('views/admin/product attributes/add/AddProductAttributes')),
  policies: lazy(() => import('views/admin/product attributes/Policies/ProductPolicies')),
};
const productclass = {
  add: lazy(() => import('views/admin/product class/add/AddProductClass')),
};
const coupon = {
  list: lazy(() => import('views/admin/Coupon/CouponList')),
  add: lazy(() => import('views/admin/Coupon/Coupon')),
  detail: lazy(() => import('views/admin/Coupon/CouponDetail')),
};
const homePage = {
  trending: lazy(() => import('views/admin/Home Page Section/Trending')),
  display: lazy(() => import('views/admin/Home Page Section/Display')),
  discover: lazy(() => import('views/admin/Home Page Section/Discover')),
};
const reports = {
  productsReport: lazy(() => import('views/admin/Reports/products/ProductsReport')),
};

/* ------------------------------------------------------------------ */
/* -------------------------  Seller Panel   ------------------------ */
/* ------------------------------------------------------------------ */

const sellerDashboard = lazy(() => import('views/seller/dashboard/Dashboard'));
const sellerProfile = lazy(() => import('views/seller/profile/Profile'));
const seriesProduct = {
  list: lazy(() => import('views/seller/series products/List/ListSeriesProduct')),
  ExistingVariantList: lazy(() => import('views/seller/series products/Add/existingVariants/ExistingVariantList')),
  sellerLocations: lazy(() => import('views/seller/series products/Add/locationscomponent/SellerLocations')),
  add: lazy(() => import('views/seller/series products/Add/AddVariants')),
};
const tmtProducts = {
  list: lazy(() => import('views/seller/tmt products/List/ListViewProduct')),
  relationallist: lazy(() => import('views/seller/tmt products/List/RelationalListViewProduct')),
  add: lazy(() => import('views/seller/tmt products/Add/Add')),
  detail: lazy(() => import('views/seller/tmt products/Detail/DetailViewProduct')),
};
const sellerProducts = {
  list: lazy(() => import('views/seller/Product/List/ListViewProduct')),
  individualProducts: lazy(() => import('views/seller/Product/List/IndividualProducts')),
  multiplelist: lazy(() => import('views/seller/Product/List/ListViewProducts')),
  multiplevariantlist: lazy(() => import('views/seller/Product/List/VariantListViewProduct')),
  multiplesellervariantlist: lazy(() => import('views/seller/Product/List/MultipleVariantListViewProduct')),
  updateVariantPricesBySeller: lazy(() => import('views/seller/Product/List/UpdateVariantPricesBySeller')),
  updateVariantDiscountBySeller: lazy(() => import('views/seller/Product/List/UpdateVariantDiscountBySeller')),
  updateVariantStockBySeller: lazy(() => import('views/seller/Product/List/UpdateVariantStockBySeller')),
  productReview: lazy(() => import('views/seller/Product/List/ProductReview')),
  add: lazy(() => import('views/seller/Product/Add/AddNewProduct')),
  addvariant: lazy(() => import('views/seller/Product/Add/AddNewProductVariant')),
  addtoexcel: lazy(() => import('views/seller/Product/Add/AddNewProducttoExcel')),
  existingProductList: lazy(() => import('views/seller/Product/Existing Product/List/ListViewProduct')),
  addLocationToExistingProduct: lazy(() => import('views/seller/Product/Existing Product/Detail/DetailViewProduct')),
  detail: lazy(() => import('views/seller/Product/Detail/DetailViewProduct')),
};
const sellerreview = {
  reviewList: lazy(() => import('views/seller/Review/ReviewListView')),
};
const superSellerProducts = {
  list: lazy(() => import('views/superSeller/Product/List/ListViewProduct')),
  add: lazy(() => import('views/superSeller/Product/Add/AddNewProduct')),
  existingProductList: lazy(() => import('views/superSeller/Product/Existing Product/List/ListViewProduct')),
  addLocationToExistingProduct: lazy(() => import('views/superSeller/Product/Existing Product/Detail/DetailViewProduct')),
  detail: lazy(() => import('views/superSeller/Product/Detail/DetailViewProduct')),
};
const superSellerOrders = {
  list: lazy(() => import('views/superSeller/Order/List/ListViewOrder')),
  detail: lazy(() => import('views/superSeller/Order/Detail/DetailViewOrder')),
};
const baProfile = lazy(() => import('views/superSeller/profile/Profile'));
const yourSeller = {
  list: lazy(() => import('views/superSeller/Seller/ListViewProduct')),
  add: lazy(() => import('views/superSeller/Seller/AddNewProduct')),
  detail: lazy(() => import('views/superSeller/Seller/Detail')),
};
const sellerCommission = {
  commissionDetails: lazy(() => import('views/seller/Commission/Commission')),
};
const sellerOrders = {
  orderlist: lazy(() => import('views/seller/Order/List/ListOrder')),
  issuelist: lazy(() => import('views/seller/Order/List/IssueList')),
  detail: lazy(() => import('views/seller/Order/Detail/OrdersDetail')),
  issuedetail: lazy(() => import('views/seller/Order/Detail/IssueDetail')),
};
const sellerQuotes = {
  list: lazy(() => import('views/seller/Quotation/QuotationList')),
  detail: lazy(() => import('views/seller/Quotation/Quotation')),
};
const enquiryDashboard = lazy(() => import('views/enquiry/dashboard/Dashboard'));
const enquiryProducts = {
  list: lazy(() => import('views/enquiry/Product/List/ListViewProduct')),
  add: lazy(() => import('views/enquiry/Product/Add/AddNewProduct')),
  detail: lazy(() => import('views/enquiry/Product/Detail/DetailViewProduct')),
};
const serviceDashboard = lazy(() => import('views/service/dashboard/Dashboard'));
const serviceProducts = {
  list: lazy(() => import('views/service/Product/List/ListViewProduct')),
};
const subBusinessDashboard = lazy(() => import('views/subBusiness/dashboard/Dashboard'));

/* ------------------------------------------------------------------ */
/* -------------------------  Dealer Panel   ------------------------ */
/* ------------------------------------------------------------------ */

const subBusinessProducts = {
  list: lazy(() => import('views/subBusiness/Product/List/ListViewProduct')),
  detail: lazy(() => import('views/subBusiness/Product/Detail/DetailViewProduct')),
};
const subBusinessOrders = {
  detail: lazy(() => import('views/subBusiness/Order/Detail/OrdersDetail')),
  orderlist: lazy(() => import('views/subBusiness/Order/List/ListOrder')),
};
const dealerProfile = lazy(() => import('views/subBusiness/profile/Profile'));
const storefront = {
  home: lazy(() => import('views/storefront/home/Home')),
  subcat2: lazy(() => import('views/storefront/subcategory/SubCategoryL2')),
  categories: lazy(() => import('views/storefront/categories/Categories')),
  detail: lazy(() => import('views/storefront/detail/Detail')),
  cart: lazy(() => import('views/storefront/cart/Cart')),
  sellerReview: lazy(() => import('views/storefront/sellerReview/SellerReview')),
  checkout: lazy(() => import('views/storefront/checkout/Checkout')),
  CheckoutDMT: lazy(() => import('views/storefront/checkout/CheckoutDMT')),
  ThankYou: lazy(() => import('views/storefront/checkout/ThankYou')),
  handleResponse: lazy(() => import('views/storefront/checkout/Response/HandleResponse')),
  success: lazy(() => import('views/storefront/checkout/Response/Success')),
  failure: lazy(() => import('views/storefront/checkout/Response/Failure')),
  invoice: lazy(() => import('views/storefront/invoice/Invoice')),
  invoiceRes: lazy(() => import('views/storefront/invoiceRes/Invoice')),
  invoiceWithoutRes: lazy(() => import('views/storefront/invoiceWithoutRes/Invoice')),
  b2b: lazy(() => import('views/storefront/customer/B2BRegistration')),
  searchResult: lazy(() => import('layout/nav/sidebar-menu/SearchResult')),
  wishlist: lazy(() => import('views/storefront/wishlist/Wishlist')),
  blogs: lazy(() => import('views/storefront/blogs/Blogs')),
  seller: lazy(() => import('views/storefront/customer/SellerRegistration')),
  bulk: lazy(() => import('views/storefront/enquiry/BulkEnquiry')),
  send: lazy(() => import('views/storefront/enquiry/SendEnquiry')),
  rough: lazy(() => import('views/storefront/rough/Rough')),
  blogsDetail: lazy(() => import('views/storefront/blogs/DetailBlog')),
  DetailBlogFixed: lazy(() => import('views/storefront/blogs/DetailBlogFixed')),
  DetailBlogFixed1: lazy(() => import('views/storefront/blogs/DetailBlogFixed1')),
  // order: lazy(() => import('views/user profile/order/OrderDetail')),
  aboutUs: lazy(() => import('views/storefront/footerComponents/AboutUs')),
  associateWithUs: lazy(() => import('views/storefront/footerComponents/AssociateWithUs')),
  sellerAssociate: lazy(() => import('views/storefront/footerComponents/SellerAssociate')),
  serviceProviderAssociate: lazy(() => import('views/storefront/footerComponents/ServiceProviderAssociate')),
  tradeAssociate: lazy(() => import('views/storefront/footerComponents/TradeAssociate')),
  sellerFeesAndCommission: lazy(() => import('views/storefront/footerComponents/SellerFeesAndCommission')),
  businessAssociate: lazy(() => import('views/storefront/footerComponents/BusinessAssociate')),
  businessAssociateSubDealer: lazy(() => import('views/storefront/footerComponents/BusinessAssociateSubDealer')),
  contactUs: lazy(() => import('views/storefront/footerComponents/ContactUs')),
  FAQ: lazy(() => import('views/storefront/footerComponents/FAQ')),
  meetOurTeam: lazy(() => import('views/storefront/footerComponents/MeetOurTeam')),
  userpolicies: lazy(() => import('views/storefront/footerComponents/UserPolicies')),
  privacypolicy: lazy(() => import('views/storefront/footerComponents/PrivacyPolicy')),
  cancellationpolicy: lazy(() => import('views/storefront/footerComponents/CancellationPolicy')),
  shippingpolicy: lazy(() => import('views/storefront/footerComponents/ShippingPolicy')),
  returnpolicy: lazy(() => import('views/storefront/footerComponents/ReturnPolicy')),
  cookiepolicy: lazy(() => import('views/storefront/footerComponents/CookiePolicy')),
  paymentmode: lazy(() => import('views/storefront/footerComponents/ModesOfPayments')),
  series: lazy(() => import('views/storefront/subcategory/DetailSection/Series')),
  single: lazy(() => import('views/storefront/subcategory/DetailSection/Single')),
  tmt: lazy(() => import('views/storefront/subcategory/DetailSection/TMT')),
};
const superSellerDashboard = lazy(() => import('views/superSeller/dashboard/Dashboard'));

/* ------------------------------------------------------------------ */
/* ------------------------- Accounts Panel  ------------------------ */
/* ------------------------------------------------------------------ */

const accountsDashboard = lazy(() => import('views/accounts/dashboard/Dashboard'));
const accountsOrders = {
  orderlist: lazy(() => import('views/accounts/Order/List/ListOrder')),
  detail: lazy(() => import('views/accounts/Order/Detail/OrdersDetail')),
};
const accountsCommission = {
  commissionlist: lazy(() => import('views/accounts/Commission/List/CommissionList')),
  detail: lazy(() => import('views/accounts/Commission/Detail/CommissionDetail')),
};
const accountsPaymentTransfer = {
  paymenttransferlist: lazy(() => import('views/accounts/PaymentTransfer/List/PaymentTransferList')),
  detail: lazy(() => import('views/accounts/PaymentTransfer/Detail/PaymentTransferDetail')),
};

/* ------------------------------------------------------------------ */
/* -------------------------   User Profile  ------------------------ */
/* ------------------------------------------------------------------ */

const userProfile = {
  profile: lazy(() => import('views/user profile/dashboard/Dashboard')),
  orderdetail: lazy(() => import('views/user profile/order/Detail/OrderDetail')),
  orderlist: lazy(() => import('views/user profile/order/List/ListOrder')),
};

const appRoot = DEFAULT_PATHS.APP.endsWith('/') ? DEFAULT_PATHS.APP.slice(1, DEFAULT_PATHS.APP.length) : DEFAULT_PATHS.APP;
const appMasterAdmin = `${appRoot}/master_admin`;
const appAdmin = `${appRoot}/admin`;
const appSeller = `${appRoot}/seller`;
const appSuperSeller = `${appRoot}/superSeller`;
const appEnquiry = `${appRoot}/enquiry`;
const appService = `${appRoot}/service`;
const appSubBusiness = `${appRoot}/subBusiness`;
const appAccounts = `${appRoot}/accounts`;

const routesAndMenuItems = {
  mainMenuItems: [
    // Public routes starts
    {
      path: DEFAULT_PATHS.APP,
      exact: true,
      label: 'Home',
      component: storefront.home,
    },

    // user routes
    {
      path: '/order/:id',
      exact: true,
      label: 'orderID',
      icon: 'orderID',
      component: userProfile.orderdetail,
      hideInMenu: true,
    },
    {
      path: '/user',
      exact: true,
      redirect: true,
      to: '/user/profile',
      label: 'Users',
      icon: 'user',
      roles: [USER_ROLE.Customer],
      hideInMenu: true,
      subs: [
        { path: '/profile', label: 'profile', component: userProfile.profile, hideInMenu: true },
        // { path: '/orders/:id', label: 'ordersID', component: userProfile.orderdetail, hideInMenu: true },
        { path: '/orders', label: 'Orders', component: userProfile.orderlist, hideInMenu: true },
      ],
    },
    {
      path: '/category/:categoryname',
      exact: true,
      label: 'subcat2',
      icon: 'pallete',
      component: storefront.subcat2,
      hideInMenu: true,
      subs: [
        { path: '/series', label: 'series', component: storefront.series, hideInMenu: true },
        { path: '/single', label: 'single', component: storefront.single, hideInMenu: true },
        { path: '/tmt', label: 'tmt', component: storefront.tmt, hideInMenu: true },
      ],
    },
    {
      path: '/product/:identifier',
      exact: true,
      label: 'Detail',
      icon: 'news',
      component: storefront.detail,
      hideInMenu: true,
    },
    {
      path: '/categories',
      exact: true,
      label: 'Categories',
      icon: 'diagram-1',
      component: storefront.categories,
      hideInMenu: true,
    },
    {
      path: '/wishlist',
      exact: true,
      label: 'Wishlist',
      icon: 'heart',
      component: storefront.wishlist,
      hideInMenu: true,
      protected: true,
    },
    {
      path: '/cart',
      exact: true,
      label: 'Cart',
      icon: 'cart',
      component: storefront.cart,
      hideInMenu: true,
    },
    {
      path: '/sellerReview/:id',
      exact: true,
      label: 'Seller Review',
      icon: 'cart',
      component: storefront.sellerReview,
      hideInMenu: true,
    },
    {
      path: '/checkout',
      exact: true,
      label: 'Checkout',
      icon: 'handbag',
      component: storefront.checkout,
      hideInMenu: true,
      protected: true,
    },
    {
      path: '/checkout/directpayment/:orderID',
      exact: true,
      label: 'Checkout',
      icon: 'handbag',
      component: storefront.CheckoutDMT,
      hideInMenu: true,
      protected: true,
    },
    {
      path: '/checkout/directpayment/thankyou/:orderID',
      exact: true,
      label: 'ThankYou',
      icon: 'handbag',
      component: storefront.ThankYou,
      hideInMenu: true,
      protected: true,
    },
    {
      path: '/checkout/handleresponse/:txnID',
      exact: true,
      label: 'HandleResponse',
      icon: 'handbag',
      component: storefront.handleResponse,
      hideInMenu: true,
      protected: true,
    },
    {
      path: '/checkout/success',
      exact: true,
      label: 'success',
      icon: 'handbag',
      component: storefront.success,
      hideInMenu: true,
      protected: true,
    },
    {
      path: '/checkout/failure',
      exact: true,
      label: 'Checkout',
      icon: 'handbag',
      component: storefront.failure,
      hideInMenu: true,
      protected: true,
    },
    {
      path: '/invoice',
      exact: true,
      label: 'Invoice',
      icon: 'book',
      component: storefront.invoice,
      hideInMenu: true,
    },
    {
      path: '/invoiceRes',
      exact: true,
      label: 'Invoice',
      icon: 'book',
      component: storefront.invoiceRes,
      hideInMenu: true,
    },
    {
      path: '/invoiceWithoutRes',
      exact: true,
      label: 'Invoice',
      icon: 'book',
      component: storefront.invoiceWithoutRes,
      hideInMenu: true,
    },
    {
      path: '/blogs',
      exact: true,
      label: 'Blogs',
      icon: 'edit-square',
      component: storefront.blogs,
      hideInMenu: true,
    },
    {
      path: '/blogs/detail/:id',
      exact: true,
      label: 'Detail Blog',
      icon: 'bookmark',
      component: storefront.blogsDetail,
      hideInMenu: true,
    },
    {
      path: '/blog/b/Top-Best-TMT-bar-in-India-for-house-construction-3',
      exact: true,
      label: 'Detail Blog',
      icon: 'bookmark',
      component: storefront.DetailBlogFixed,
      hideInMenu: true,
    },
    {
      path: '/blog/b/Top-10-Manufacturers-of-TMT-Bar-Company-in-India-2023',
      exact: true,
      label: 'Detail Blog',
      icon: 'bookmark',
      component: storefront.DetailBlogFixed1,
      hideInMenu: true,
    },
    {
      path: '/b2b_registration',
      exact: true,
      label: 'B2B Registration',
      icon: 'destination',
      component: storefront.b2b,
      protected: true,
      hideInMenu: true,
    },
    {
      path: '/search',
      exact: true,
      label: 'Search Result',
      icon: 'destination',
      component: storefront.searchResult,
      // protected: true,
      hideInMenu: true,
    },
    {
      path: '/bulk/:productName',
      exact: true,
      label: 'Bulk Enquiry',
      icon: 'destination',
      component: storefront.bulk,
      // protected: true,
      hideInMenu: true,
    },
    {
      path: '/rough',
      exact: true,
      label: 'Rough',
      icon: 'destination',
      component: storefront.rough,
      hideInMenu: true,
    },
    {
      path: '/send/:productname',
      exact: true,
      label: 'Send Enquiry',
      icon: 'destination',
      component: storefront.send,
      // protected: true,
      hideInMenu: true,
    },
    {
      path: '/seller_registration',
      exact: true,
      label: 'Seller Registration',
      icon: 'pound',
      component: storefront.seller,
      protected: true,
      hideInMenu: true,
    },
    {
      path: '/associate_with_us',
      exact: true,
      label: 'Associate With Us',
      icon: 'pound',
      component: storefront.associateWithUs,
      hideInMenu: true,
    },
    {
      path: '/seller_associate',
      exact: true,
      label: 'Seller Associate',
      icon: 'pound',
      component: storefront.sellerAssociate,
      hideInMenu: true,
    },
    {
      path: '/service_provider_associate',
      exact: true,
      label: 'Service Provider Associate',
      icon: 'pound',
      component: storefront.serviceProviderAssociate,
      hideInMenu: true,
    },
    {
      path: '/trade_associate',
      exact: true,
      label: 'Seller Associate',
      icon: 'pound',
      component: storefront.tradeAssociate,
      hideInMenu: true,
    },
    {
      path: '/seller-fees-and-commission',
      exact: true,
      label: 'Seller Fees And Commission',
      icon: 'pound',
      component: storefront.sellerFeesAndCommission,
      hideInMenu: true,
    },
    {
      path: '/business_associate',
      exact: true,
      label: 'Business Associate',
      icon: 'pound',
      component: storefront.businessAssociate,
      hideInMenu: true,
    },
    {
      path: '/business_associate_sub_dealer',
      exact: true,
      label: 'Business Associate Sub_dealer',
      icon: 'pound',
      component: storefront.businessAssociateSubDealer,
      hideInMenu: true,
    },
    {
      path: '/about_us',
      exact: true,
      label: 'About Us',
      icon: 'pound',
      component: storefront.aboutUs,
      hideInMenu: true,
    },
    {
      path: '/contact_us',
      exact: true,
      label: 'About Us',
      icon: 'pound',
      component: storefront.contactUs,
      hideInMenu: true,
    },
    {
      path: '/faq',
      exact: true,
      label: 'FAQ',
      icon: 'pound',
      component: storefront.FAQ,
      hideInMenu: true,
    },
    {
      path: '/meet_our_team',
      exact: true,
      label: 'About Us',
      icon: 'pound',
      component: storefront.meetOurTeam,
      hideInMenu: true,
    },
    {
      path: '/user_policies',
      exact: true,
      label: 'User Policies',
      icon: 'pound',
      component: storefront.userpolicies,
      hideInMenu: true,
    },
    {
      path: '/privacy_policy',
      exact: true,
      label: 'Privacy Policy',
      icon: 'pound',
      component: storefront.privacypolicy,
      hideInMenu: true,
    },
    {
      path: '/cancellation_policy',
      exact: true,
      label: 'Cancellation Policy',
      icon: 'pound',
      component: storefront.cancellationpolicy,
      hideInMenu: true,
    },
    {
      path: '/return_policy',
      exact: true,
      label: 'Return Policy',
      icon: 'pound',
      component: storefront.returnpolicy,
      hideInMenu: true,
    },
    {
      path: '/cookie_policy',
      exact: true,
      label: 'Cookie Policy',
      icon: 'pound',
      component: storefront.cookiepolicy,
      hideInMenu: true,
    },
    {
      path: '/shipping_policy',
      exact: true,
      label: 'Shipping Policy',
      icon: 'pound',
      component: storefront.shippingpolicy,
      hideInMenu: true,
    },
    {
      path: '/payment_mode',
      exact: true,
      label: 'Payment Mode',
      icon: 'pound',
      component: storefront.paymentmode,
      hideInMenu: true,
    },

    // user side routes ends
  ],
  sidebarItems: [
    /* ------------------------------------------------------------------ */
    /* ----------------------  Master Admin Dashboard   ----------------- */
    /* ------------------------------------------------------------------ */

    {
      path: '/master_admin',
      exact: true,
      redirect: true,
      to: `${appMasterAdmin}/dashboard`,
    },
    {
      path: `${appMasterAdmin}/dashboard`,
      component: masterAdmin.dashboard,
      label: <span className="badge blockquote mb-0 bg-primary">Master Admin Dashboard</span>,
      // icon: 'shop',
      roles: [USER_ROLE.MasterAdmin],
    },
    {
      path: `${appMasterAdmin}/user`,
      exact: true,
      redirect: true,
      to: `${appMasterAdmin}/user/list`,
      label: 'Users',
      icon: 'user',
      roles: [USER_ROLE.MasterAdmin],
      subs: [{ path: '/list', label: 'List', component: masterAdmin.createAdminList }],
    },

    /* ------------------------------------------------------------------ */
    /* ----------------------  Portal Admin Dashboard   ----------------- */
    /* ------------------------------------------------------------------ */

    {
      path: '/admin',
      exact: true,
      redirect: true,
      to: `${appAdmin}/dashboard`,
    },
    {
      path: `${appAdmin}/dashboard`,
      component: dashboard,
      label: <span className="badge blockquote mb-0 bg-primary">Portal Admin Dashboard</span>,
      roles: [USER_ROLE.Admin],
    },
    {
      path: `${appAdmin}/user`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/user/list`,
      label: 'Users',
      icon: 'user',
      roles: [USER_ROLE.Admin],
      subs: [
        { path: '/list', label: 'User List', component: user.list },
        { path: '/detail/:id', label: 'Detail', component: user.detail, hideInMenu: true },
        { path: '/orderdetail/:orderid', label: 'orderdetail', component: user.orderdetail, hideInMenu: true },
        { path: '/orderlist/:userID', label: 'orderlist', component: user.orderlist, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/order`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/order/list`,
      label: 'Orders',
      icon: 'main-course',
      roles: [USER_ROLE.Admin],

      subs: [
        { path: '/list', label: 'All Orders', component: order.orderlist },
        { path: '/issuelist', label: 'Orders with Issues', component: order.issuelist },
        { path: '/detail/:id', label: 'Detail', component: order.detail, hideInMenu: true },
        { path: '/issuedetail/:id', label: 'Detail', component: order.issuedetail, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/category`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/category/list`,
      label: 'Categories ',
      icon: 'diagram-1',
      roles: [USER_ROLE.Admin],
      subs: [{ path: '/list', label: 'All Categories', component: category.list }],
    },
    {
      path: `${appAdmin}/product`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/product/list`,
      label: 'Individual Products',
      icon: 'building',
      roles: [USER_ROLE.Admin],

      subs: [
        { path: '/list', label: 'Single Seller Products List', component: product.list },
        { path: '/details/:productname', label: 'Detail', component: product.detail, hideInMenu: true },
        { path: '/multipleseller', label: 'Multiple Seller', component: product.multipleseller, hideInMenu: true },
        { path: '/multiplesellerlist', label: 'Multiple Seller Products List', component: product.multiplesellerlist },
        { path: '/variantname/:seriesId', label: 'Add Variant', component: product.variantname, hideInMenu: true },
        { path: '/seriesdetail/:seriesId', label: 'Series Detail', component: product.seriesDetail, hideInMenu: true },
        { path: '/seriesproductdetail/:seriesId', label: 'Series Detail', component: product.seriesproductdetail, hideInMenu: true },
        { path: '/review', label: 'Review', component: product.review, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/tmt`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/tmt/list_master`,
      label: 'Series Products (Fixed)',
      icon: 'pound',
      roles: [USER_ROLE.Admin],

      subs: [
        { path: '/list_master', label: 'Product Master List', component: tmtProduct.list },
        { path: '/details/:masterID', label: 'TMT Master Detail', component: tmtProduct.detail, hideInMenu: true },
        { path: '/add_master', label: 'Add', component: tmtProduct.add, hideInMenu: true },
        { path: '/product_list', label: 'Live Series Products', component: tmtProduct.tmtList },
        { path: '/add_variant/:brandcompcat', label: 'Add Tmt Variant', component: tmtProduct.addTmtVariant, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/series`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/series/list`,
      label: 'Series Products (Custom)',
      icon: 'cupcake',
      roles: [USER_ROLE.Admin],
      tooltip: 'Series Product Custom variant',

      subs: [
        { path: '/list', label: 'List', component: series.list },
        { path: '/add', label: 'Add', component: series.add },
        { path: '/detail/:seriesId', label: 'Detail', component: series.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/product_approval`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/product_approval/list`,
      label: 'Product Approval',
      icon: 'building',
      roles: [USER_ROLE.Admin],
      subs: [
        { path: '/list', label: 'Individual Product', component: productApproval.productApprovalList },
        { path: '/details/:identifier', label: 'Detail', component: productApproval.detail, hideInMenu: true },
        { path: '/listSuperProduct', label: 'BA Product', component: productApproval.productApprovalListSuperProduct },
        { path: '/detailsSuperProduct/:identifier', label: 'Detail', component: productApproval.detailSuperProduct, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/product_attributes`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/product_attributes/add`,
      label: 'Product Attributes',
      icon: 'hexagon',
      roles: [USER_ROLE.Admin],
      subs: [
        { path: '/add', label: 'All Product Attributes', component: productattributes.add },
        { path: '/policies', label: 'Products Policies', component: productattributes.policies },
      ],
    },
    {
      path: `${appAdmin}/product_class/add`,
      exact: true,
      label: 'Product Class',
      icon: 'radio',
      roles: [USER_ROLE.Admin],
      component: productclass.add,
    },
    {
      path: `${appAdmin}/seller`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/seller/list`,
      label: 'Sellers',
      icon: 'pound',
      roles: [USER_ROLE.Admin],
      hideInMenu: true,
      subs: [
        { path: '/list', label: 'All Sellers', component: seller.list },
        { path: '/add/:id', label: 'Add', component: seller.add, hideInMenu: true },
        { path: '/detail/:id/commission', label: 'Commission', component: seller.commission, hideInMenu: true },
        { path: '/detail/:id', label: 'Detail', component: seller.detail, hideInMenu: true },
        { path: '/reviewdetail/:id', label: 'Detail', component: seller.reviewdetail, hideInMenu: true },

        { path: '/product_list/:sellerID', label: 'Product List', component: seller.productList, hideInMenu: true },
        { path: '/series_list/:sellerID', label: 'Product List', component: seller.seriesList, hideInMenu: true },
        { path: '/:sellerID/orderdetail/:orderid', label: 'orderdetail', component: seller.orderdetail, hideInMenu: true },
        { path: '/orderlist/:sellerID', label: 'orderlist', component: seller.orderlist, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/associate`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/associate/list`,
      label: 'Associate',
      icon: 'pound',
      roles: [USER_ROLE.Admin],
      subs: [
        { path: '/enquiry', label: 'Enquiry Associate', component: associate.enquiry },
        { path: '/service', label: 'Service Associate', component: associate.service },
        { path: '/seller', label: 'Seller Associate', component: associate.seller },
        { path: '/business', label: 'Business Associate', component: associate.business },
        { path: '/businessDetail/:id', label: 'Business Detail', component: associate.businessDetail, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/b2b`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/b2b/list`,
      label: 'B2B',
      icon: 'destination',
      roles: [USER_ROLE.Admin],
      subs: [
        { path: '/list', label: 'All B2B', component: b2b.list },
        { path: '/detail/:id', label: 'Detail', component: b2b.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/advertisment`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/advertisment/down_banner`,
      label: 'Advertisement',
      icon: 'radio',
      roles: [USER_ROLE.Admin],

      subs: [
        { path: '/home_advertisment', label: 'Home Page Ads', component: ad.add },
        { path: '/down_banner', label: 'Down Banner', component: ad.list },
        { path: '/category_advertisment', label: 'Category Ads', component: ad.cat },
        { path: '/productDetailPageSlider', label: 'Product Detail Ads', component: ad.pro },
        { path: '/ads_category_master', label: 'Ad Tier', component: ad.adTier },
        { path: '/ads_category', label: 'Ads Pricing', component: ad.adsCategory },
        { path: '/approval', label: 'Ad Approvals', component: ad.approval },
      ],
    },
    {
      path: `${appAdmin}/homePage`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/homePage/down_banner`,
      label: 'Home Page Section',
      icon: 'check-square',
      roles: [USER_ROLE.Admin],

      subs: [
        { path: '/trending', label: 'Trending', component: homePage.trending },
        { path: '/display', label: 'Display', component: homePage.display },
        { path: '/discover', label: 'Discover', component: homePage.discover },
      ],
    },
    {
      path: `${appAdmin}/email`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/email/list`,
      label: 'Email Template',
      icon: 'email',
      roles: [USER_ROLE.Admin],
      hideInMenu: true,

      subs: [
        { path: '/list', label: 'List', component: email.list },
        { path: '/add', label: 'Add', component: email.add },
        { path: '/edit/:emailId', label: 'Detail', component: email.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/coupon`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/coupon/add`,
      label: 'Coupon Code',
      icon: 'edit-square',
      roles: [USER_ROLE.Admin],

      subs: [
        { path: '/list', label: 'List', component: coupon.list },
        { path: '/add', label: 'Add', component: coupon.add, hideInMenu: true },
        { path: '/detail', label: 'Detail', component: coupon.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/activity`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/activity/carts`,
      label: 'Customer Activity',
      icon: 'check-square',
      roles: [USER_ROLE.Admin],

      subs: [
        {
          path: '/carts',
          label: 'Add to Carts',
          component: activity.carts,
        },
        {
          path: '/wishlists',
          label: 'Wishlists',
          component: activity.wishlists,
        },
        {
          path: '/contact',
          label: 'Contact Enquiries',
          component: activity.contactEnquiries,
        },
        {
          path: '/product',
          label: 'Product Enquiries',
          component: activity.productEnquiries,
        },
        {
          path: '/bulk_product',
          label: 'Bulk Product Enquiries',
          component: activity.bulkProductEnquiries,
        },
        {
          path: '/cart_enquiries',
          label: 'Cart Enquiries',
          component: activity.cartEnquiries,
        },
        {
          path: '/subscriptions',
          label: 'Subscriptions',
          component: activity.subscriptions,
        },
      ],
    },
    {
      path: `${appAdmin}/shipping`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/shipping/list`,
      label: 'Shipping',
      icon: 'shipping',
      roles: [USER_ROLE.Admin],

      subs: [
        { path: '/list', label: 'List', component: shipping.list },
        { path: '/add', label: 'Add', component: shipping.add },
      ],
    },
    {
      path: `${appAdmin}/blog`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/blog/list`,
      label: 'Blog',
      icon: 'edit-square',
      roles: [USER_ROLE.Admin],

      subs: [
        { path: '/list', label: 'List', component: blog.list },
        { path: '/add', label: 'Add', component: blog.add },
        { path: '/detail/:id', label: 'Detail', component: blog.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/siteContent`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/siteContent/cart_value`,
      label: 'Site Content',
      icon: 'content',
      roles: [USER_ROLE.Admin],
      subs: [
        { path: '/cart_value', label: 'Cart Value', component: siteContent.list },
        { path: '/seo_page', label: 'SEO Page', component: siteContent.seopage },
        { path: '/user_Add', label: 'User Policies', component: siteContent.userAdd },
        { path: '/associate_Add', label: 'Associate Content', component: siteContent.associateAdd },
        { path: '/associate_PDF', label: 'Associate PDF', component: siteContent.associatePDF, hideInMenu: true },
        { path: '/add', label: 'Site Content', component: siteContent.add },
        { path: '/navbarlogo', label: 'Website Logo', component: siteContent.navbarLogo },
        { path: '/detail', label: 'Detail', component: siteContent.detail, hideInMenu: true },
        { path: '/meet_our_team', label: 'Meet Our Team', component: siteContent.meetOurTeam },
        { path: '/emailconfig', label: 'Email IDs', component: siteContent.emailconfig },
        { path: '/adminEnquiryEmail', label: 'Admin Enquiry Email', component: siteContent.adminenquiryemail, hideInMenu: true },
        { path: '/accountsEnquiryEmail', label: 'Accounts Enquiry Email', component: siteContent.accountsenquiryemail, hideInMenu: true },
        { path: '/contactPageEmail', label: 'Contact Page Email', component: siteContent.contactpageemail, hideInMenu: true },
        { path: '/sellerEnquiryEmail', label: 'Seller Enquiry Email', component: siteContent.sellernquiryemail, hideInMenu: true },
        { path: '/bulkEnquiryEmail', label: 'Bulk Enquiry Email', component: siteContent.bulkenquiryemail, hideInMenu: true },
        { path: '/shoppingCartEnquiryEmail', label: 'Shopping Cart Enquiry Email', component: siteContent.shoppingcartenquiryemail, hideInMenu: true },
        { path: '/sellerB2bEnquiryEmail', label: 'Seller/B2B Enquiry Email', component: siteContent.sellerb2benquiryemail, hideInMenu: true },
        { path: '/orderReceivedEnquiryEmail', label: 'Order Received Enquiry Email', component: siteContent.orderreceivedenquiryemail, hideInMenu: true },
        { path: '/email', label: 'Email Message', component: siteContent.email },
        { path: '/sms', label: 'SMS Message', component: siteContent.sms },
        { path: '/whatsappapi', label: 'Whatsapp Message', component: siteContent.whatsappapi },
        { path: '/bulkEnquiry', label: 'Bulk Enquiry', component: siteContent.bulkEnquiry, hideInMenu: true },
        { path: '/buyRequest', label: 'Buy Request', component: siteContent.buyRequest, hideInMenu: true },
        { path: '/buyRequestsubject', label: 'Buy Request', component: siteContent.buyRequestsubject, hideInMenu: true },
        { path: '/buyRequestFailure', label: 'Buy Request Failure', component: siteContent.buyRequestFailure, hideInMenu: true },
        { path: '/buyRequestFailuresubject', label: 'Buy Request Failure subject', component: siteContent.buyRequestFailuresubject, hideInMenu: true },
        { path: '/buyRequestProof', label: 'buyRequestProof', component: siteContent.buyRequestProof, hideInMenu: true },
        { path: '/buyRequestProofsubject', label: 'buyRequestProofsubject', component: siteContent.buyRequestProofsubject, hideInMenu: true },
        { path: '/buyRequestReceipt', label: 'buyRequestReceipt', component: siteContent.buyRequestReceipt, hideInMenu: true },
        { path: '/buyRequestReceiptsubject', label: 'buyRequestReceiptsubject', component: siteContent.buyRequestReceiptsubject, hideInMenu: true },
        { path: '/contactEnquiryPage', label: 'contactEnquiryPage', component: siteContent.contactEnquiryPage, hideInMenu: true },
        { path: '/contactEnquiryPagesubject', label: 'contactEnquiryPagesubject', component: siteContent.contactEnquiryPagesubject, hideInMenu: true },
        { path: '/customerRegistration', label: 'Customer Registration', component: siteContent.customerRegistration, hideInMenu: true },
        { path: '/customerRegistrationsubject', label: 'Customer Registration Subject', component: siteContent.customerRegistrationsubject, hideInMenu: true },
        { path: '/forgotPassword', label: 'forgotPassword', component: siteContent.forgotPassword, hideInMenu: true },
        { path: '/forgotPasswordsubject', label: 'forgotPasswordsubject', component: siteContent.forgotPasswordsubject, hideInMenu: true },
        { path: '/onlineOrderSuccess', label: 'onlineOrderSuccess', component: siteContent.onlineOrderSuccess, hideInMenu: true },
        { path: '/onlineOrderSuccesssubject', label: 'onlineOrderSuccesssubject', component: siteContent.onlineOrderSuccesssubject, hideInMenu: true },
        { path: '/orderCancel', label: 'orderCancel', component: siteContent.orderCancel, hideInMenu: true },
        { path: '/orderCancelsubject', label: 'orderCancelsubject', component: siteContent.orderCancelsubject, hideInMenu: true },
        { path: '/orderDelivery', label: 'orderDelivery', component: siteContent.orderDelivery, hideInMenu: true },
        { path: '/orderDeliverysubject', label: 'orderDeliverysubject', component: siteContent.orderDeliverysubject, hideInMenu: true },
        { path: '/orderDispatched', label: 'orderDispatched', component: siteContent.orderDispatched, hideInMenu: true },
        { path: '/orderDispatchedsubject', label: 'orderDispatchedsubject', component: siteContent.orderDispatchedsubject, hideInMenu: true },
        { path: '/orderPacked', label: 'orderPacked', component: siteContent.orderPacked, hideInMenu: true },
        { path: '/orderPackedsubject', label: 'orderPackedsubject', component: siteContent.orderPackedsubject, hideInMenu: true },
        { path: '/shoppingCartEnquiryPage', label: 'shoppingCartEnquiryPage', component: siteContent.shoppingCartEnquiryPage, hideInMenu: true },
        {
          path: '/shoppingCartSubjectEnquiryPage',
          label: 'shoppingCartSubjectEnquiryPage',
          component: siteContent.shoppingCartSubjectEnquiryPage,
          hideInMenu: true,
        },
        { path: '/subscriptionLetter', label: 'subscriptionLetter', component: siteContent.subscriptionLetter, hideInMenu: true },
        { path: '/updatePassword', label: 'updatePassword', component: siteContent.updatePassword, hideInMenu: true },
        { path: '/updatePasswordsubject', label: 'updatePasswordsubject', component: siteContent.updatePasswordsubject, hideInMenu: true },
        { path: '/enquiryRegistrationSubject', label: 'Enquiry Registration', component: siteContent.enquiryRegistrationSubject, hideInMenu: true },
        { path: '/enquiryRegistration', label: 'Enquiry Registration', component: siteContent.enquiryRegistration, hideInMenu: true },
        { path: '/enquiryRequestApproveSubject', label: 'Enquiry Request Approve', component: siteContent.enquiryRequestApproveSubject, hideInMenu: true },
        { path: '/enquiryRequestApprove', label: 'Enquiry Request Approve', component: siteContent.enquiryRequestApprove, hideInMenu: true },
        { path: '/serviceRegistrationSubject', label: 'Service Registration', component: siteContent.serviceRegistrationSubject, hideInMenu: true },
        { path: '/serviceRegistration', label: 'Service  Registration', component: siteContent.serviceRegistration, hideInMenu: true },
        { path: '/serviceRequestApproveSubject', label: 'Service  Request Approve', component: siteContent.serviceRequestApproveSubject, hideInMenu: true },
        { path: '/serviceRequestApprove', label: 'Service  Request Approve', component: siteContent.serviceRequestApprove, hideInMenu: true },
        { path: '/sellerRegistrationSubject', label: 'Seller Registration', component: siteContent.sellerRegistrationSubject, hideInMenu: true },
        { path: '/sellerRegistration', label: 'Seller Registration', component: siteContent.sellerRegistration, hideInMenu: true },
        { path: '/sellerRequestApproveSubject', label: 'Seller Request Approve', component: siteContent.sellerRequestApproveSubject, hideInMenu: true },
        { path: '/sellerRequestApprove', label: 'Seller Request Approve', component: siteContent.sellerRequestApprove, hideInMenu: true },
        { path: '/businessRegistrationSubject', label: 'businessRegistration', component: siteContent.businessRegistrationSubject, hideInMenu: true },
        { path: '/businessRegistration', label: 'businessRegistration', component: siteContent.businessRegistration, hideInMenu: true },
        { path: '/businessRequestApproveSubject', label: 'Business Request Approve', component: siteContent.businessRequestApproveSubject, hideInMenu: true },
        { path: '/businessRequestApprove', label: 'Enquiry Business Approve', component: siteContent.businessRequestApprove, hideInMenu: true },
        {
          path: '/dealerAlreadyRegistrationSubject',
          label: 'Dealer Associate Registration',
          component: siteContent.dealerAlreadyRegistrationSubject,
          hideInMenu: true,
        },
        { path: '/dealerAlreadyRegistration', label: 'Dealer Associate Registration', component: siteContent.dealerAlreadyRegistration, hideInMenu: true },
        {
          path: '/dealerAlreadyRequestApproveSubject',
          label: 'Dealer Associate Request Approve',
          component: siteContent.dealerAlreadyRequestApproveSubject,
          hideInMenu: true,
        },
        { path: '/dealerAlreadyRequestApprove', label: 'Dealer Associate Approve', component: siteContent.dealerAlreadyRequestApprove, hideInMenu: true },
        {
          path: '/dealerNewRegistrationSubject',
          label: 'New DA Registration',
          component: siteContent.dealerNewRegistrationSubject,
          hideInMenu: true,
        },
        { path: '/dealerNewRegistration', label: 'New DA Registration', component: siteContent.dealerNewRegistration, hideInMenu: true },
        { path: '/sellerRequestReject', label: 'Seller Request Reject', component: siteContent.sellerRequestReject, hideInMenu: true },
        { path: '/b2bRagistration', label: 'B2B Ragistration', component: siteContent.b2bRagistration, hideInMenu: true },
        { path: '/b2bRequestApprove', label: 'B2B Request Approve', component: siteContent.b2bRequestApprove, hideInMenu: true },
        { path: '/b2bRequestReject', label: 'B2B Request Reject', component: siteContent.b2bRequestReject, hideInMenu: true },
        { path: '/singleEnquiryCustomer', label: 'Single Enquiry Customer', component: siteContent.singleEnquiryCustomer, hideInMenu: true },
        { path: '/singleEnquirySubjectCustomer', label: 'Single Product Enquiry', component: siteContent.singleEnquirySubjectCustomer, hideInMenu: true },
        { path: '/bulkEnquiryCustomer', label: 'Bulk Enquiry Customer', component: siteContent.bulkEnquiryCustomer, hideInMenu: true },
        { path: '/bulkEnquirySubjectCustomer', label: 'Bulk Enquiry Subject', component: siteContent.bulkEnquirySubjectCustomer, hideInMenu: true },
        { path: '/onlineTryEmail', label: 'onlineTryEmail', component: siteContent.onlineTryEmail, hideInMenu: true },
        { path: '/onlineTryEmailsubject', label: 'onlineTryEmailsubject', component: siteContent.onlineTryEmailsubject, hideInMenu: true },
        { path: '/orderSuccessSeller', label: 'orderSuccessSeller', component: siteContent.orderSuccessSeller, hideInMenu: true },
        { path: '/orderSuccessSellersubject', label: 'orderSuccessSellersubject', component: siteContent.orderSuccessSellersubject, hideInMenu: true },
        { path: '/buyRequestOrderPlaced', label: 'dmtorderPlaced', component: siteContent.buyRequestOrderPlaced, hideInMenu: true },
        { path: '/orderCancelSeller', label: 'orderCancelSeller', component: siteContent.orderCancelSeller, hideInMenu: true },
        { path: '/orderCancelSellersubject', label: 'orderCancelSellersubject', component: siteContent.orderCancelSellersubject, hideInMenu: true },
        { path: '/dmtpaymentAdmin', label: 'dmtpaymentAdmin', component: siteContent.dmtpaymentAdmin, hideInMenu: true },
        { path: '/dmtpaymentAdminsubject', label: 'dmtpaymentAdminsubject', component: siteContent.dmtpaymentAdminsubject, hideInMenu: true },
        { path: '/customerRegistrationsms', label: 'Customer Registration', component: siteContent.customerRegistrationsms, hideInMenu: true },
        { path: '/customerRegistrationWhatsappapi', label: 'Customer Registration', component: siteContent.customerRegistrationWhatsappapi, hideInMenu: true },
        { path: '/ordersuccessWhatsappapi', label: 'Order Success Whatsapp Message', component: siteContent.ordersuccessWhatsappapi, hideInMenu: true },
        {
          path: '/ordersuccesssellerWhatsappapi',
          label: 'Order Success Seller Whatsapp Message',
          component: siteContent.ordersuccesssellerWhatsappapi,
          hideInMenu: true,
        },
        { path: '/orderpackWhatsappapi', label: 'Order Pack Whatsapp Message', component: siteContent.orderpackWhatsappapi, hideInMenu: true },
        { path: '/ordershipWhatsappapi', label: 'Order Pack Whatsapp Message', component: siteContent.ordershipWhatsappapi, hideInMenu: true },
        { path: '/orderdeliveryWhatsappapi', label: 'Order Pack Whatsapp Message', component: siteContent.orderdeliveryWhatsappapi, hideInMenu: true },
        { path: '/orderCancelCustomer', label: 'Order Cancel Customer', component: siteContent.orderCancelCustomersms, hideInMenu: true },
        { path: '/orderCancelseller', label: 'Order Cancel Seller', component: siteContent.orderCancelSellersms, hideInMenu: true },
        { path: '/orderdeliverysms', label: 'Order Delivery ', component: siteContent.orderdeliverysms, hideInMenu: true },
        { path: '/ordercheckoutsms', label: 'Order CheckOut', component: siteContent.ordercheckoutsms, hideInMenu: true },
        { path: '/ordershipsms', label: 'Order Shipping Customer', component: siteContent.ordershipsms, hideInMenu: true },
        { path: '/orderpacksms', label: 'Order Shipping Customer', component: siteContent.orderpacksms, hideInMenu: true },
        { path: '/ordersuccesssms', label: 'Order Success SMS', component: siteContent.ordersuccesssms, hideInMenu: true },
        { path: '/ordersuccesssellersms', label: 'DMT Payment Proof Submit', component: siteContent.ordersuccesssellersms, hideInMenu: true },
        { path: '/onlineorderreceiveds', label: 'Online Order Received seller', component: siteContent.onlineorderreceiveds, hideInMenu: true },
        { path: '/dmtorderreceiveds', label: 'DMT Order Received seller', component: siteContent.dmtorderreceiveds, hideInMenu: true },
        { path: '/dmtorderreceivedc', label: 'DMT Order Received Customer', component: siteContent.dmtorderreceivedc, hideInMenu: true },
        { path: '/productapprove', label: 'product Approve', component: siteContent.productapprove, hideInMenu: true },
        { path: '/productapprovesubject', label: 'product Approve', component: siteContent.productapprovesubject, hideInMenu: true },
        { path: '/productreject', label: 'product reject', component: siteContent.productreject, hideInMenu: true },
        { path: '/productrejectsubject', label: 'product reject subject', component: siteContent.productrejectsubject, hideInMenu: true },
        { path: '/productclass', label: 'product class', component: siteContent.productclass, hideInMenu: true },
        { path: '/productclasssubject', label: 'product class subject', component: siteContent.productclasssubject, hideInMenu: true },
        { path: '/onlinepaymentfailed', label: 'onlinepaymentfailed', component: siteContent.onlinepaymentfailed, hideInMenu: true },
        { path: '/onlinepaymentfailedsubject', label: 'online payment failed subject', component: siteContent.onlinepaymentfailedsubject, hideInMenu: true },
        { path: '/review', label: 'Review', component: siteContent.review, hideInMenu: true },
        { path: '/reviewsubject', label: 'Review Subject', component: siteContent.reviewsubject, hideInMenu: true },
      ],
    },
    {
      path: `${appAdmin}/account`,
      exact: true,
      redirect: true,
      to: `${appAdmin}/account/add`,
      label: 'Setting',
      icon: 'suitcase',
      roles: [USER_ROLE.Admin],
      subs: [
        // { path: '/add', label: 'Add', component: account.add },
        { path: '/setting', label: 'Website Setting', component: account.setting },
        { path: '/detail', label: 'DMT Account Detail', component: account.detail },
        { path: '/pincode', label: 'Pincode', component: account.pincode },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* ------------------------  Enquiry Dashboard   -------------------- */
    /* ------------------------------------------------------------------ */

    {
      path: `${appEnquiry}/dashboard`,
      component: enquiryDashboard,
      label: <span className="badge blockquote mb-0 bg-primary">Enquiry Dashboard</span>,
      roles: [USER_ROLE.Enquiry],
    },
    {
      path: `${appEnquiry}/product`,
      exact: true,
      redirect: true,
      to: `${appEnquiry}/product/list`,
      label: 'Products',
      icon: 'suitcase',
      roles: [USER_ROLE.Enquiry],
      subs: [
        { path: '/list', label: 'All Products', component: enquiryProducts.list },
        { path: '/add', label: 'Add Product', component: enquiryProducts.add },
        { path: '/details/:productname', label: 'Detail', component: enquiryProducts.detail, hideInMenu: true },
      ],
    },

    /* ------------------------------------------------------------------ */
    /* ------------------------  Service Dashboard   -------------------- */
    /* ------------------------------------------------------------------ */

    {
      path: `${appService}/dashboard`,
      component: serviceDashboard,
      label: <span className="badge blockquote mb-0 bg-primary">Service Dashboard</span>,
      roles: [USER_ROLE.Service],
    },
    {
      path: `${appService}/product`,
      exact: true,
      redirect: true,
      to: `${appService}/product/list`,
      label: 'Service',
      icon: 'suitcase',
      roles: [USER_ROLE.Service],
      subs: [{ path: '/list', label: 'All Service', component: serviceProducts.list }],
    },

    /* ------------------------------------------------------------------ */
    /* ------------------------  Seller Dashboard   --------------------- */
    /* ------------------------------------------------------------------ */

    {
      path: '/seller',
      exact: true,
      redirect: true,
      to: `${appSeller}/dashboard`,
    },
    {
      path: `${appSeller}/dashboard`,
      component: sellerDashboard,
      label: <span className="badge blockquote mb-0 bg-primary">Seller Associate Dashboard</span>,
      roles: [USER_ROLE.Seller],
    },
    {
      path: `${appSeller}/product`,
      exact: true,
      redirect: true,
      to: `${appSeller}/product/list`,
      label: 'Individual Products',
      icon: 'suitcase',
      roles: [USER_ROLE.Seller],
      subs: [
        { path: '/list', label: 'Single Seller Products List', component: sellerProducts.list },
        { path: '/individualProducts', label: 'Single Seller Products List', component: sellerProducts.individualProducts, hideInMenu: true },
        { path: '/multiplelist', label: 'Multiple Seller Products List', component: sellerProducts.multiplelist },
        {
          path: '/multiplevariantlist/:seriesproductid',
          label: 'Multiple Seller Products List',
          component: sellerProducts.multiplevariantlist,
          hideInMenu: true,
        },
        {
          path: '/multiplesellervariantlist/:seriesproductid/location_list/:seriesvariantId',
          label: 'Multiple Seller Products List',
          component: sellerProducts.multiplesellervariantlist,
          hideInMenu: true,
        },
        { path: '/add', component: sellerProducts.add },
        { path: '/updateVariantPricesBySeller', component: sellerProducts.updateVariantPricesBySeller, hideInMenu: true },
        { path: '/updateVariantDiscountBySeller', component: sellerProducts.updateVariantDiscountBySeller, hideInMenu: true },
        { path: '/updateVariantStockBySeller', component: sellerProducts.updateVariantStockBySeller, hideInMenu: true },
        { path: '/productReview', component: sellerProducts.productReview, hideInMenu: true },
        { path: '/addvariant', component: sellerProducts.addvariant },
        { path: '/addtoexcel', label: 'Add Product', component: sellerProducts.addtoexcel, hideInMenu: true },
        {
          path: '/add_from_existing_product/details/:productname',
          label: 'addLocationToExistingProduct',
          component: sellerProducts.addLocationToExistingProduct,
          hideInMenu: true,
        },
        { path: '/details/:productname', label: 'Detail', component: sellerProducts.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appSeller}/tmt_product`,
      exact: true,
      redirect: true,
      to: `${appSeller}/tmt_product/list`,
      label: 'Series Products (Fixed)',
      icon: 'suitcase',
      roles: [USER_ROLE.Seller],
      tooltip: 'Series Product Fixed variant', // <-- Added tooltip
      subs: [
        { path: '/list', label: 'List', component: tmtProducts.list },
        { path: '/relationallist', label: 'Relational List', component: tmtProducts.relationallist, hideInMenu: true },
        { path: '/add', label: '', component: tmtProducts.add },
        { path: '/details/:tmtproductId', label: 'Detail', component: tmtProducts.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appSeller}/series`,
      exact: true,
      redirect: true,
      to: `${appSeller}/series/list`,
      label: 'Series Products (Custom)',
      icon: 'suitcase',
      roles: [USER_ROLE.Seller],
      subs: [
        { path: '/list', label: 'List', component: seriesProduct.list },
        {
          path: '/variant_list/:seriesproductid/location_list/:seriesvariantId',
          label: 'location_list',
          component: seriesProduct.sellerLocations,
          hideInMenu: true,
        },
        { path: '/variant_list/:seriesproductid', label: 'variant_list', component: seriesProduct.ExistingVariantList, hideInMenu: true },
        { path: '/add_variant/:seriesproductid', label: 'Add', component: seriesProduct.add, hideInMenu: true },
      ],
    },
    {
      path: `${appSeller}/order`,
      exact: true,
      redirect: true,
      to: `${appSeller}/order/list`,
      label: 'Orders',
      icon: 'main-course',
      roles: [USER_ROLE.Seller],

      subs: [
        { path: '/list', label: 'All Orders', component: sellerOrders.orderlist },
        { path: '/issuelist', label: 'Orders with Issues', component: sellerOrders.issuelist },
        { path: '/detail', label: 'Detail', component: sellerOrders.detail, hideInMenu: true },
        { path: '/issuedetail', label: 'Detail', component: sellerOrders.issuedetail, hideInMenu: true },
      ],
    },
    {
      path: `${appSeller}/quotation`,
      exact: true,
      redirect: true,
      to: `${appSeller}/quotation/list`,
      label: 'Quotation',
      icon: 'list',
      roles: [USER_ROLE.Seller],

      subs: [
        { path: '/list', label: 'List', component: sellerQuotes.list },
        { path: '/detail', label: 'Detail', component: sellerQuotes.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appSeller}/commission`,
      exact: true,
      redirect: true,
      to: `${appSeller}/commission/list`,
      label: 'Sales Commission',
      icon: 'money',
      roles: [USER_ROLE.Seller],
      subs: [{ path: '/list', label: 'Commission List', component: sellerCommission.commissionDetails }],
    },
    {
      path: `${appSeller}/review`,
      exact: true,
      redirect: true,
      to: `${appSeller}/sellerReview`,
      label: 'Seller Reviews',
      icon: 'suitcase',
      roles: [USER_ROLE.Seller],

      subs: [
        {
          path: '/sellerReview',
          label: 'Seller Reviews',
          component: sellerreview.reviewList,
        },
      ],
    },
    {
      path: `${appSeller}/profile`,
      component: sellerProfile,
      label: 'SA Profile',
      icon: 'user',
      roles: [USER_ROLE.Seller],
      hidden: true,
    },
    {
      path: `${appSeller}/advertisement`,
      component: sellerProfile,
      label: 'Advertisement',
      icon: 'radio',
      roles: [USER_ROLE.Seller],
      hidden: true,
      subs: [
        { path: '/list', label: 'Advertisement List', component: MyAds },
        { path: '/add', label: 'Add Advertisement', component: Advertisement },
      ],
  },

    /* ------------------------------------------------------------------ */
    /* --------------------------    BA Dashboard   --------------------- */
    /* ------------------------------------------------------------------ */

    {
      path: `${appSuperSeller}/dashboard`,
      component: superSellerDashboard,
      label: <span className="badge blockquote mb-0 bg-primary">BA Dashboard</span>,
      roles: [USER_ROLE.SuperSeller],
    },
    {
      path: `${appSuperSeller}/product`,
      exact: true,
      redirect: true,
      to: `${appSuperSeller}/product/list`,
      label: 'Products',
      icon: 'suitcase',
      roles: [USER_ROLE.SuperSeller],
      subs: [
        { path: '/list', label: 'All Products', component: superSellerProducts.list },
        { path: '/add', label: 'Add Product', component: superSellerProducts.add },
        {
          path: '/add_from_existing_product/details/:productname',
          label: 'addLocationToExistingProduct',
          component: superSellerProducts.addLocationToExistingProduct,
          hideInMenu: true,
        },
        { path: '/details/:productname', label: 'Detail', component: superSellerProducts.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appSuperSeller}/order`,
      exact: true,
      redirect: true,
      to: `${appSuperSeller}/order/list`,
      label: 'Orders',
      icon: 'suitcase',
      roles: [USER_ROLE.SuperSeller],
      subs: [
        { path: '/list', label: 'All Orders', component: superSellerOrders.list },
        { path: '/detail/:id', label: 'Detail', component: superSellerOrders.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appSuperSeller}/seller`,
      exact: true,
      redirect: true,
      to: `${appSuperSeller}/seller/list`,
      label: 'Dealer Associate List',
      icon: 'suitcase',
      roles: [USER_ROLE.SuperSeller],
      subs: [
        { path: '/add', label: 'Add Dealer', component: yourSeller.add },
        { path: '/list', label: 'All Dealer', component: yourSeller.list },
        { path: '/detail/:id', label: 'Add Detail', component: yourSeller.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appSuperSeller}/profile`,
      component: baProfile,
      label: 'BA Profile',
      icon: 'user',
      roles: [USER_ROLE.SuperSeller],
      hidden: true,
    },
    {
      path: `${appSuperSeller}/advertisement`,
      component: sellerProfile,
      label: 'Advertisement',
      icon: 'radio',
      roles: [USER_ROLE.SuperSeller],
      hidden: true,
    },

    /* ------------------------------------------------------------------ */
    /* ------------------------   Dealer Dashboard  --------------------- */
    /* ------------------------------------------------------------------ */

    {
      path: `${appSubBusiness}/dashboard`,
      component: subBusinessDashboard,
      label: <span className="badge blockquote mb-0 bg-primary">Dealer Associate Dashboard</span>,
      roles: [USER_ROLE.SubBusiness],
    },
    {
      path: `${appSubBusiness}/product`,
      exact: true,
      redirect: true,
      to: `${appSubBusiness}/product/list`,
      label: 'Products',
      icon: 'suitcase',
      roles: [USER_ROLE.SubBusiness],
      subs: [
        { path: '/list', label: 'All Product', component: subBusinessProducts.list },
        { path: '/details/:productname', label: 'Detail', component: subBusinessProducts.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appSubBusiness}/order`,
      exact: true,
      redirect: true,
      to: `${appSubBusiness}/order/list`,
      label: 'Orders',
      icon: 'main-course',
      roles: [USER_ROLE.SubBusiness],

      subs: [
        { path: '/list', label: 'All Orders', component: subBusinessOrders.orderlist },
        { path: '/detail', label: 'Detail', component: subBusinessOrders.detail, hideInMenu: true },
      ],
    },
    {
      path: `${appSubBusiness}/profile`,
      component: dealerProfile,
      label: 'DA Profile',
      icon: 'user',
      roles: [USER_ROLE.SubBusiness],
      hidden: true,
    },

    /* ------------------------------------------------------------------ */
    /* ------------------------  Account Dashboard  --------------------- */
    /* ------------------------------------------------------------------ */

    /* ------------------------------------------------------------------
     * ACCOUNTS DASHBOARD
     * ------------------------------------------------------------------ */
    {
      path: `${appAccounts}/dashboard`,
      component: accountsDashboard,
      label: <span className="badge blockquote mb-0 bg-primary">Accounts Dashboard</span>,
      roles: [USER_ROLE.Accounts],
    },

    /* ------------------------------------------------------------------
     * ORDERS MODULE (ACCOUNTS)
     * ------------------------------------------------------------------ */
    {
      path: `${appAccounts}/order`,
      exact: true,
      redirect: true,
      to: `${appAccounts}/order/list`,
      label: 'Orders',
      icon: 'main-course',
      roles: [USER_ROLE.Accounts],
      subs: [
        { path: '/list', label: 'All Orders', component: accountsOrders.orderlist },
        { path: '/detail/:id', label: 'Detail', component: accountsOrders.detail, hideInMenu: true },
      ],
    },

    /* ------------------------------------------------------------------
     * COMMISSION REPORT MODULE
     * ----------------------------------------------------------------- */
    {
      path: `${appAccounts}/commission`,
      exact: true,
      redirect: true,
      to: `${appAccounts}/commission/list`,
      label: 'Commission Report',
      icon: 'pound',
      roles: [USER_ROLE.Accounts],
      subs: [
        { path: '/list', label: 'All Commission Report', component: accountsCommission.commissionlist },
        { path: '/detail/:id', label: 'Detail', component: accountsCommission.detail, hideInMenu: true },
      ],
    },

    /* -----------------------------------------------------------------
     * PAYMENT TRANSFER MODULE
     * ----------------------------------------------------------------- */
    {
      path: `${appAccounts}/paymenttransfer`,
      exact: true,
      redirect: true,
      to: `${appAccounts}/paymenttransfer/list`,
      label: 'Payment Transfer Report',
      icon: 'pound',
      roles: [USER_ROLE.Accounts],
      subs: [
        { path: '/list', label: 'All Commission Report', component: accountsPaymentTransfer.paymenttransferlist },
        { path: '/detail/:id', label: 'Detail', component: accountsPaymentTransfer.detail, hideInMenu: true },
      ],
    },
    
  ],
};

export default routesAndMenuItems;

import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useFinanceStore = defineStore('finance', {
    state: () => ({
        vatRateOptions: [0, 0.03, 0.06, 0.09, 0.13],
        defaultVATRate: 0.13,
        currencySymbol: '¥',
        paymentTermOptions: [0, 7, 15, 30, 45, 60, 90],
        defaultPaymentTermDays: 30,
        pagination: { defaultPageSize: 20, pageSizeOptions: [10, 20, 50, 100] },
        // 新增配置
        taxConfig: { returnTypes: [], returnStatuses: [], invoiceTypes: [], invoiceStatuses: [] },
        bankConfig: { transactionTypes: [], paymentMethods: [], transactionCategories: {} },
        glConfig: { documentTypes: [], entryStatuses: [] },
        isLoaded: false
    }),
    actions: {
        async loadSettings() {
            if (this.isLoaded) return
            try {
                const res = await request.get('/finance/settings')
                if (res.success && res.data) {
                    if (res.data.tax) {
                        this.vatRateOptions = res.data.tax.vatRateOptions || [0, 0.03, 0.06, 0.09, 0.13]
                        this.defaultVATRate = res.data.tax.defaultVATRate !== undefined ? res.data.tax.defaultVATRate : 0.13
                    }
                    if (res.data.currency) {
                        this.currencySymbol = res.data.currency.symbol || '¥'
                    }
                    if (res.data.invoice) {
                        this.paymentTermOptions = res.data.invoice.paymentTermOptions || [0, 7, 15, 30, 45, 60, 90]
                        this.defaultPaymentTermDays = res.data.invoice.defaultPaymentTermDays || 30
                        this.pagination = res.data.invoice.pagination || { defaultPageSize: 20, pageSizeOptions: [10, 20, 50, 100] }
                    }
                    // 加载新增配置
                    if (res.data.tax) {
                        this.taxConfig = {
                            returnTypes: res.data.tax.returnTypes || [],
                            returnStatuses: res.data.tax.returnStatuses || [],
                            invoiceTypes: res.data.tax.invoiceTypes || [],
                            invoiceStatuses: res.data.tax.invoiceStatuses || []
                        }
                    }
                    if (res.data.bank) {
                        this.bankConfig = res.data.bank || { transactionTypes: [], paymentMethods: [], transactionCategories: {} }
                    }
                    if (res.data.gl) {
                        this.glConfig = res.data.gl || { documentTypes: [], entryStatuses: [] }
                    }
                }
                this.isLoaded = true
            } catch (error) {
                console.error('加载财务配置失败:', error)
            }
        },

        // 格式化税率
        formatTaxRate(rate) {
            if (rate === 0) return '0%'
            return `${(rate * 100).toFixed(0)}%`
        }
    }
})

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_prop = """          <AdminPaymentManagement
            contingents={contingents}
            athletes={athletes}
            settings={settings}
            onUpdateContingentPaymentStatus={handleUpdateContingentPaymentStatus}
            onUpdateContingentNominalRevisi={handleUpdateContingentNominalRevisi}
          />"""

new_prop = """          <AdminPaymentManagement
            contingents={contingents}
            athletes={athletes}
            settings={settings}
            onUpdateContingentPaymentStatus={handleUpdateContingentPaymentStatus}
            onUpdateContingentNominalRevisi={handleUpdateContingentNominalRevisi}
            onUpdateInvoiceNumber={handleUpdateInvoiceNumber}
          />"""

content = content.replace(old_prop, new_prop)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Done fix invoice prop")

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InspectionForm } from './types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  value: {
    flex: 1,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  teamMember: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
    alignItems: 'flex-start',
  },
  checklistCategory: {
    width: 120,
    fontWeight: 'bold',
  },
  checklistDescription: {
    flex: 1,
    paddingRight: 10,
  },
  checklistStatus: {
    width: 45, // Aumentei levemente para caber "REPROV"
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 9,
  },
  statusPass: {
    color: '#16a34a',
  },
  statusFail: {
    color: '#dc2626',
  },
  statusNA: {
    color: '#6b7280',
  },
  observations: {
    marginTop: 10,
    padding: 10,
    border: '1px solid #d1d5db',
    minHeight: 100,
  },
});

interface PDFDocumentProps {
  data: InspectionForm;
}

export function InspectionPDFDocument({ data }: PDFDocumentProps) {
  return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Relatório de Inspeção Digital</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Projeto:</Text>
              <Text style={styles.value}>{data.header.projectName || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Localização:</Text>
              <Text style={styles.value}>{data.header.location || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Data:</Text>
              <Text style={styles.value}>{data.header.date || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Inspetor:</Text>
              <Text style={styles.value}>{data.header.inspectorName || 'N/A'}</Text>
            </View>
          </View>

          {/* Team Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipe</Text>
            {data.team.length > 0 ? (
                data.team.map((member) => (
                    <View key={member.id} style={styles.teamMember}>
                      <Text style={styles.label}>{member.role}:</Text>
                      <Text style={styles.value}>{member.name}</Text>
                    </View>
                ))
            ) : (
                <Text style={{ paddingLeft: 10, color: '#6b7280' }}>Nenhum membro adicionado</Text>
            )}
          </View>

          {/* Checklist Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Checklist de Inspeção</Text>
            {data.checklist.length > 0 ? (
                data.checklist.map((item) => {
                  const statusStyle =
                      item.status === 'pass'
                          ? styles.statusPass
                          : item.status === 'fail'
                              ? styles.statusFail
                              : styles.statusNA;

                  return (
                      <View key={item.id} style={styles.checklistItem}>
                        <Text style={styles.checklistCategory}>{item.category}</Text>
                        <Text style={styles.checklistDescription}>{item.description}</Text>
                        <Text style={[styles.checklistStatus, statusStyle]}>
                          {item.status === 'pass' ? 'APROV' : item.status === 'fail' ? 'REPROV' : 'N/A'}
                        </Text>
                      </View>
                  );
                })
            ) : (
                <Text style={{ paddingLeft: 10, color: '#6b7280' }}>Nenhum item adicionado</Text>
            )}
          </View>

          {/* Observations Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.observations}>
              <Text>{data.observations || 'Nenhuma observação registrada'}</Text>
            </View>
          </View>
        </Page>
      </Document>
  );
}
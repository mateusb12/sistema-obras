import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import type { InspectionStatus } from '../inspection-history'
import type { InspectionForm } from './types'

const logoUrl = new URL('../../assets/casasmanagerdark.png', import.meta.url)
  .href

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 180,
    height: 'auto',
    marginBottom: 10,
    marginLeft: -5,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  header: {
    marginBottom: 16,
    borderBottom: '2px solid #000',
    paddingBottom: 10,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  value: {
    flex: 1,
  },
  section: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  teamMember: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  checklistRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 3,
  },
  checklistHeaderRow: {
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #d1d5db',
    paddingTop: 3,
    paddingBottom: 3,
  },
  headerCell: {
    fontWeight: 'bold',
  },
  checklistCategory: {
    width: 52,
    fontSize: 8,
  },
  checklistDescription: {
    width: 130,
    paddingRight: 6,
    fontSize: 8,
  },
  checklistAcceptance: {
    width: 140,
    paddingRight: 6,
    fontSize: 8,
  },
  checklistStatus: {
    width: 48,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 8,
  },
  checklistDetail: {
    width: 85,
    fontSize: 8,
    color: '#374151',
    paddingRight: 4,
  },
  checklistResolution: {
    width: 85,
    fontSize: 8,
    color: '#374151',
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
    marginTop: 8,
    padding: 10,
    border: '1px solid #d1d5db',
    minHeight: 70,
  },
})

interface PDFDocumentProps {
  data: InspectionForm
  status?: InspectionStatus
}

export function InspectionPDFDocument({ data, status }: PDFDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoUrl} style={styles.logo} />
          </View>
          {(status === 'OPEN_CORRECTION' ||
            status === 'DRAFT_OPEN_CORRECTION') && (
            <Text style={styles.pendingBadge}>PENDENTE DE CORREÇÃO</Text>
          )}
          <Text style={styles.title}>Relatório de Inspeção Digital</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Título:</Text>
            <Text style={styles.value}>{data.header.title || 'N/A'}</Text>
          </View>
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
            <Text style={styles.value}>
              {data.header.inspectorName || 'N/A'}
            </Text>
          </View>
        </View>

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
            <Text style={{ paddingLeft: 10, color: '#6b7280' }}>
              Nenhum membro adicionado
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist de Inspeção</Text>
          {data.checklist.length > 0 ? (
            <>
              <View style={[styles.checklistRow, styles.checklistHeaderRow]}>
                <Text style={[styles.checklistCategory, styles.headerCell]}>
                  Categoria
                </Text>
                <Text style={[styles.checklistDescription, styles.headerCell]}>
                  Itens Inspecionados
                </Text>
                <Text style={[styles.checklistAcceptance, styles.headerCell]}>
                  Critério de aceitação
                </Text>
                <Text style={[styles.checklistStatus, styles.headerCell]}>
                  Status
                </Text>
                <Text style={[styles.checklistDetail, styles.headerCell]}>
                  Detalhamento
                </Text>
                <Text style={[styles.checklistResolution, styles.headerCell]}>
                  Tratativa
                </Text>
              </View>
              {data.checklist.map((item) => {
                const statusStyle =
                  item.status === 'pass'
                    ? styles.statusPass
                    : item.status === 'fail'
                      ? styles.statusFail
                      : styles.statusNA

                const detailText =
                  item.status === 'fail' ? item.failReason || '-' : '-'

                const reinspectionText =
                  item.reinspectionResult === 'effective'
                    ? ' — Correção validada'
                    : item.reinspectionResult === 'ineffective'
                      ? ' — Correção rejeitada'
                      : ''

                const resolutionText =
                  item.status === 'fail'
                    ? item.failResolution === 'needs_correction'
                      ? `Solicitar correção${item.correctionPlan?.trim() ? ` — Plano: ${item.correctionPlan.trim()}` : ''}${item.reinspectionDate ? ` — Reinspeção: ${item.reinspectionDate}` : ''}${reinspectionText}`
                      : item.failResolution === 'non_conform'
                        ? 'Aceitar como está'
                        : '-'
                    : '-'

                return (
                  <View key={item.id} style={styles.checklistRow}>
                    <Text style={styles.checklistCategory}>
                      {item.category}
                    </Text>
                    <Text style={styles.checklistDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.checklistAcceptance}>
                      {item.acceptanceCriteria || '-'}
                    </Text>
                    <Text style={[styles.checklistStatus, statusStyle]}>
                      {item.status === 'pass'
                        ? 'APROV'
                        : item.status === 'fail'
                          ? 'REPROV'
                          : 'N/A'}
                    </Text>
                    <Text style={styles.checklistDetail}>{detailText}</Text>
                    <Text style={styles.checklistResolution}>
                      {resolutionText}
                    </Text>
                  </View>
                )
              })}
            </>
          ) : (
            <Text style={{ paddingLeft: 10, color: '#6b7280' }}>
              Nenhum item adicionado
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <View style={styles.observations}>
            <Text>{data.observations || 'Nenhuma observação registrada'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

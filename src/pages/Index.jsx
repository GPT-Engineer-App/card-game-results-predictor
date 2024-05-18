import { useState, useEffect } from "react";
import { Container, Text, VStack, Table, Thead, Tbody, Tr, Th, Td, Select, Button, IconButton, Tabs, TabList, TabPanels, Tab, TabPanel, Box, useToast } from "@chakra-ui/react";
import { FaPlus, FaSave, FaTrashAlt } from "react-icons/fa";

const suits = ["❤️", "♦️", "♣️", "♠️"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

const Index = () => {
  const [results, setResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const toast = useToast();

  useEffect(() => {
    loadResults();
  }, []);

  const addResult = () => {
    if (!selectedCard || !selectedOption) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار بطاقة واختيار خيار.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newResult = {
      hitNumber: results.length + 1,
      card: selectedCard,
      option: selectedOption,
    };

    setResults([...results, newResult]);
  };

  const deleteResult = (hitNumber) => {
    const updatedResults = results.filter((result) => result.hitNumber !== hitNumber);
    setResults(updatedResults);
  };

  const saveResults = () => {
    localStorage.setItem("savedResults", JSON.stringify(results));
    toast({
      title: "تم الحفظ",
      description: "تم حفظ النتائج بنجاح.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const loadResults = () => {
    const savedResults = JSON.parse(localStorage.getItem("savedResults"));
    if (savedResults) {
      setResults(savedResults);
    }
  };

  const clearPage = () => {
    setResults([]);

    localStorage.removeItem("savedResults");
    toast({
      title: "تم المسح",
      description: "تم مسح الصفحة بنجاح.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const getCardValue = (card) => {
    const rank = card.slice(0, -2);
    const suit = card.slice(-2);
    return ranks.indexOf(rank) * suits.length + suits.indexOf(suit);
  };

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Text fontSize="2xl">نتائج لعبة البطاقات</Text>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>رقم الضربة</Th>
              <Th>البطاقة</Th>
              <Th>الخيار المختار</Th>
              <Th>الإجراء</Th>
            </Tr>
          </Thead>
          <Tbody>
            {results.map((result) => (
              <Tr key={result.hitNumber}>
                <Td>{result.hitNumber}</Td>
                <Td>{result.card}</Td>
                <Td>{result.option}</Td>
                <Td>
                  <IconButton aria-label="Delete" icon={<FaTrashAlt />} onClick={() => deleteResult(result.hitNumber)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Box>
          <Select placeholder="اختر بطاقة" onChange={(e) => setSelectedCard(e.target.value)}>
            {suits.map((suit) =>
              ranks.map((rank) => (
                <option key={rank + suit} value={rank + suit}>
                  {rank + suit}
                </option>
              )),
            )}
          </Select>
          <Select placeholder="اختر خيارًا" onChange={(e) => setSelectedOption(e.target.value)}>
            <option value="3.1">3.1</option>
            <option value="2.2">2.2</option>
            <option value="4.7">4.7</option>
            <option value="20">20</option>
          </Select>
          <Button leftIcon={<FaPlus />} onClick={addResult}>
            إضافة نتيجة
          </Button>
          <Button leftIcon={<FaSave />} onClick={saveResults}>
            حفظ النتائج
          </Button>
          <Button leftIcon={<FaTrashAlt />} onClick={clearPage}>
            مسح الصفحة
          </Button>
        </Box>

        <Tabs>
          <TabList>
            <Tab>❤️</Tab>
            <Tab>♦️</Tab>
            <Tab>♣️</Tab>
            <Tab>♠️</Tab>
          </TabList>
          <TabPanels>
            {suits.map((suit) => (
              <TabPanel key={suit}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>رقم الضربة</Th>
                      <Th>النتيجة</Th>
                      <Th>الإجراء</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {results
                      .filter((result) => result.card.includes(suit))
                      .map((result) => (
                        <Tr key={result.hitNumber}>
                          <Td>{result.hitNumber}</Td>
                          <Td>{result.option}</Td>
                          <Td>
                            <IconButton aria-label="Delete" icon={<FaTrashAlt />} onClick={() => deleteResult(result.hitNumber)} />
                          </Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default Index;
